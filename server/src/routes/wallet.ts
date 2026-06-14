import { Router, type Response } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { config } from "../config.js";
import { authRequired, type AuthedRequest } from "../auth.js";

export const walletRouter = Router();

const depositSchema = z.object({
  amountCents: z.number().int().positive().max(100_000_00),
});

/**
 * Deposit endpoint.
 *
 * NOTE: This uses a MOCK provider that instantly confirms the deposit so the
 * app is fully testable without real money. For production you must integrate a
 * regulated PIX payment gateway (Mercado Pago, Pagar.me, Asaas, etc.):
 *   1. Create a charge on the gateway and return its PIX QR / copy-paste code.
 *   2. Credit the user balance only from the gateway's confirmation webhook.
 * Funds must settle into the operator's licensed company account — not a
 * personal PIX key.
 */
walletRouter.post(
  "/wallet/deposit",
  authRequired,
  (req: AuthedRequest, res: Response) => {
    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const { amountCents } = parsed.data;
    const user = req.user!;

    if (config.paymentProvider !== "mock") {
      // Real gateway integration would create a pending charge here and return
      // the PIX payload for the user to pay.
      return res
        .status(501)
        .json({ error: "Gateway de pagamento real não configurado" });
    }

    const tx = db.transaction(() => {
      db.prepare(
        "UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?"
      ).run(amountCents, user.id);
      db.prepare(
        "INSERT INTO transactions (user_id, type, amount_cents, reference) VALUES (?, 'deposit', ?, 'mock')"
      ).run(user.id, amountCents);
    });
    tx();

    const balance = (
      db.prepare("SELECT balance_cents FROM users WHERE id = ?").get(user.id) as {
        balance_cents: number;
      }
    ).balance_cents;
    return res.status(201).json({ ok: true, balanceCents: balance });
  }
);

walletRouter.get(
  "/wallet/transactions",
  authRequired,
  (req: AuthedRequest, res: Response) => {
    const transactions = db
      .prepare(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(req.user!.id);
    return res.json({ transactions });
  }
);
