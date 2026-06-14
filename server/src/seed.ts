import bcrypt from "bcryptjs";
import { db, initDb } from "./db.js";

initDb();

console.log("Limpando dados...");
db.exec(`
  DELETE FROM selections;
  DELETE FROM markets;
  DELETE FROM events;
  DELETE FROM sports;
  DELETE FROM bets;
  DELETE FROM transactions;
  DELETE FROM users WHERE role = 'admin';
`);

const sports = [
  { key: "soccer", title: "Futebol", icon: "⚽" },
  { key: "basketball", title: "Basquete", icon: "🏀" },
  { key: "tennis", title: "Tênis", icon: "🎾" },
  { key: "mma", title: "MMA", icon: "🥊" },
];

const insertSport = db.prepare(
  "INSERT INTO sports (key, title, icon) VALUES (?, ?, ?)"
);
const sportIds: Record<string, number> = {};
for (const s of sports) {
  const info = insertSport.run(s.key, s.title, s.icon);
  sportIds[s.key] = Number(info.lastInsertRowid);
}

const insertEvent = db.prepare(
  "INSERT INTO events (sport_id, league, home_team, away_team, starts_at) VALUES (?, ?, ?, ?, ?)"
);
const insertMarket = db.prepare(
  "INSERT INTO markets (event_id, key, name) VALUES (?, ?, ?)"
);
const insertSelection = db.prepare(
  "INSERT INTO selections (market_id, key, name, odds) VALUES (?, ?, ?, ?)"
);

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

function rnd(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

interface Fixture {
  sport: string;
  league: string;
  home: string;
  away: string;
  inHours: number;
}

const fixtures: Fixture[] = [
  { sport: "soccer", league: "Brasileirão Série A", home: "Flamengo", away: "Palmeiras", inHours: 3 },
  { sport: "soccer", league: "Brasileirão Série A", home: "Corinthians", away: "São Paulo", inHours: 5 },
  { sport: "soccer", league: "Premier League", home: "Arsenal", away: "Chelsea", inHours: 8 },
  { sport: "soccer", league: "La Liga", home: "Real Madrid", away: "Barcelona", inHours: 26 },
  { sport: "basketball", league: "NBA", home: "Lakers", away: "Celtics", inHours: 6 },
  { sport: "basketball", league: "NBB", home: "Flamengo", away: "Franca", inHours: 10 },
  { sport: "tennis", league: "ATP Masters", home: "Alcaraz", away: "Sinner", inHours: 4 },
  { sport: "mma", league: "UFC Fight Night", home: "Silva", away: "Johnson", inHours: 30 },
];

for (const fx of fixtures) {
  const evInfo = insertEvent.run(
    sportIds[fx.sport],
    fx.league,
    fx.home,
    fx.away,
    hoursFromNow(fx.inHours)
  );
  const eventId = Number(evInfo.lastInsertRowid);

  // 1X2 / Vencedor da partida
  const matchInfo = insertMarket.run(eventId, "match_winner", "Vencedor da partida");
  const marketId = Number(matchInfo.lastInsertRowid);
  if (fx.sport === "soccer") {
    insertSelection.run(marketId, "home", fx.home, rnd(1.6, 2.8));
    insertSelection.run(marketId, "draw", "Empate", rnd(2.9, 3.6));
    insertSelection.run(marketId, "away", fx.away, rnd(2.0, 3.5));
  } else {
    insertSelection.run(marketId, "home", fx.home, rnd(1.4, 2.4));
    insertSelection.run(marketId, "away", fx.away, rnd(1.5, 2.6));
  }

  // Total de pontos/gols
  if (fx.sport === "soccer") {
    const totInfo = insertMarket.run(eventId, "totals_2_5", "Total de gols 2.5");
    const totId = Number(totInfo.lastInsertRowid);
    insertSelection.run(totId, "over", "Mais de 2.5", rnd(1.7, 2.1));
    insertSelection.run(totId, "under", "Menos de 2.5", rnd(1.7, 2.1));
  }
}

const adminEmail = "admin@apostas.local";
db.prepare(
  "INSERT INTO users (name, email, password_hash, role, balance_cents) VALUES (?, ?, ?, 'admin', ?)"
).run("Administrador", adminEmail, bcrypt.hashSync("admin123", 10), 0);

console.log("Seed concluído.");
console.log(`Admin: ${adminEmail} / admin123`);
