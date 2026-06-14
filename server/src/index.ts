import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { initDb } from "./db.js";
import { authRouter } from "./auth.js";
import { eventsRouter } from "./routes/events.js";
import { betsRouter } from "./routes/bets.js";
import { walletRouter } from "./routes/wallet.js";
import { startOddsFeed } from "./oddsFeed.js";

initDb();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api", eventsRouter);
app.use("/api", betsRouter);
app.use("/api", walletRouter);

startOddsFeed();

app.listen(config.port, () => {
  console.log(`API rodando em http://localhost:${config.port}`);
});
