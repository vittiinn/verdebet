import { db } from "./db.js";
import { config } from "./config.js";

interface SelectionRow {
  id: number;
  odds: number;
}

// Built-in odds engine: nudges open-market odds slightly every tick to emulate
// a live market. Swap this out by setting ODDS_API_KEY and implementing
// fetchFromProvider() against a legitimate sports odds API.
function simulateTick() {
  const selections = db
    .prepare(
      `SELECT sel.id, sel.odds FROM selections sel
       JOIN markets m ON m.id = sel.market_id
       JOIN events e ON e.id = m.event_id
       WHERE e.status = 'upcoming'`
    )
    .all() as SelectionRow[];

  const update = db.prepare(
    "UPDATE selections SET prev_odds = odds, odds = ?, updated_at = datetime('now') WHERE id = ?"
  );
  const tx = db.transaction((rows: SelectionRow[]) => {
    for (const s of rows) {
      // random walk within +-4%, clamped to sane bounds
      const drift = 1 + (Math.random() - 0.5) * 0.08;
      const next = Math.min(50, Math.max(1.01, Math.round(s.odds * drift * 100) / 100));
      if (next !== s.odds) update.run(next, s.id);
    }
  });
  tx(selections);
}

async function fetchFromProvider(): Promise<void> {
  // Placeholder for a real integration (e.g. The Odds API).
  // const url = `${config.oddsApiBase}/sports/?apiKey=${config.oddsApiKey}`;
  // const data = await fetch(url).then((r) => r.json());
  // ...map provider odds onto local selections...
}

export function startOddsFeed(intervalMs = 8000) {
  const tick = async () => {
    try {
      if (config.oddsApiKey) {
        await fetchFromProvider();
      } else {
        simulateTick();
      }
    } catch (err) {
      console.error("odds feed tick failed", err);
    }
  };
  tick();
  return setInterval(tick, intervalMs);
}
