import { Router, type Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { authRequired, type AuthedRequest } from "../auth.js";

export const betsRouter = Router();

const betSchema = z.object({
  selectionId: z.number().int().positive(),
  stakeCents: z.number().int().positive().max(100_000_00),
});

interface SelectionJoin {
  id: number;
  odds: number;
  selection_name: string;
  home_team: string;
  away_team: string;
}

betsRouter.post("/bets", authRequired, (req: AuthedRequest, res: Response) => {
  const parsed = betSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { selectionId, stakeCents } = parsed.data;
  const user = req.user!;

  const sel = db
    .prepare(
      `SELECT sel.id, sel.odds, sel.name AS selection_name, e.home_team, e.away_team
       FROM selections sel
       JOIN markets m ON m.id = sel.market_id
       JOIN events e ON e.id = m.event_id
       WHERE sel.id = ? AND e.status = 'upcoming'`
    )
    .get(selectionId) as SelectionJoin | undefined;
  if (!sel) return res.status(404).json({ error: "Seleção indisponível" });

  if (user.balance_cents < stakeCents) {
    return res.status(400).json({ error: "Saldo insuficiente" });
  }

  const potential = Math.round(stakeCents * sel.odds);
  const eventLabel = `${sel.home_team} x ${sel.away_team}`;

  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET balance_cents = balance_cents - ? WHERE id = ?").run(
      stakeCents,
      user.id
    );
    db.prepare(
      `INSERT INTO bets (user_id, selection_id, event_label, selection_label, odds, stake_cents, potential_return_cents)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(user.id, sel.id, eventLabel, sel.selection_name, sel.odds, stakeCents, potential);
    db.prepare(
      "INSERT INTO transactions (user_id, type, amount_cents, reference) VALUES (?, 'bet', ?, ?)"
    ).run(user.id, -stakeCents, eventLabel);
  });
  tx();

  const balance = (
    db.prepare("SELECT balance_cents FROM users WHERE id = ?").get(user.id) as {
      balance_cents: number;
    }
  ).balance_cents;

  return res.status(201).json({ ok: true, balanceCents: balance });
});

betsRouter.get("/bets", authRequired, (req: AuthedRequest, res: Response) => {
  const bets = db
    .prepare("SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC")
    .all(req.user!.id);
  return res.json({ bets });
});
