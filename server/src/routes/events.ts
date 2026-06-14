import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { authRequired, adminRequired, type AuthedRequest } from "../auth.js";

export const eventsRouter = Router();

interface SelectionRow {
  id: number;
  market_id: number;
  key: string;
  name: string;
  odds: number;
  prev_odds: number | null;
  updated_at: string;
}

function loadEvent(eventId: number) {
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(eventId) as
    | Record<string, unknown>
    | undefined;
  if (!event) return undefined;
  const markets = db
    .prepare("SELECT * FROM markets WHERE event_id = ?")
    .all(eventId) as { id: number; key: string; name: string }[];
  return {
    ...event,
    markets: markets.map((m) => ({
      ...m,
      selections: db
        .prepare("SELECT * FROM selections WHERE market_id = ?")
        .all(m.id) as SelectionRow[],
    })),
  };
}

eventsRouter.get("/sports", (_req: Request, res: Response) => {
  const sports = db.prepare("SELECT * FROM sports ORDER BY title").all();
  return res.json({ sports });
});

eventsRouter.get("/events", (req: Request, res: Response) => {
  const sportKey = typeof req.query.sport === "string" ? req.query.sport : null;
  let rows;
  if (sportKey) {
    rows = db
      .prepare(
        `SELECT e.id FROM events e
         JOIN sports s ON s.id = e.sport_id
         WHERE s.key = ? AND e.status != 'finished'
         ORDER BY e.starts_at`
      )
      .all(sportKey) as { id: number }[];
  } else {
    rows = db
      .prepare("SELECT id FROM events WHERE status != 'finished' ORDER BY starts_at")
      .all() as { id: number }[];
  }
  return res.json({ events: rows.map((r) => loadEvent(r.id)) });
});

eventsRouter.get("/events/:id", (req: Request, res: Response) => {
  const event = loadEvent(Number(req.params.id));
  if (!event) return res.status(404).json({ error: "Evento não encontrado" });
  return res.json({ event });
});

// Admin: manually update a selection's odds. Movement is tracked via prev_odds
// so the frontend can show up/down indicators.
const oddsSchema = z.object({ odds: z.number().positive().max(1000) });

eventsRouter.patch(
  "/selections/:id/odds",
  authRequired,
  adminRequired,
  (req: AuthedRequest, res: Response) => {
    const parsed = oddsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const sel = db
      .prepare("SELECT * FROM selections WHERE id = ?")
      .get(Number(req.params.id)) as SelectionRow | undefined;
    if (!sel) return res.status(404).json({ error: "Seleção não encontrada" });
    db.prepare(
      "UPDATE selections SET prev_odds = odds, odds = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(parsed.data.odds, sel.id);
    return res.json({ ok: true });
  }
);
