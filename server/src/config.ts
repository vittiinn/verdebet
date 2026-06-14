import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  dbFile: process.env.DB_FILE ?? "data.sqlite",
  // Optional integration with a legitimate sports odds API (e.g. The Odds API).
  // Leave empty to run with the built-in simulated odds engine.
  oddsApiKey: process.env.ODDS_API_KEY ?? "",
  oddsApiBase: process.env.ODDS_API_BASE ?? "https://api.the-odds-api.com/v4",
  // Payment gateway integration point. Real-money deposits require a regulated
  // PIX gateway (Mercado Pago, Pagar.me, Asaas, etc.). Left unset by default.
  paymentProvider: process.env.PAYMENT_PROVIDER ?? "mock",
};
