import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db, type UserRow } from "./db.js";
import { config } from "./config.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function publicUser(u: UserRow) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    balanceCents: u.balance_cents,
  };
}

function sign(user: UserRow) {
  return jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: "7d",
  });
}

authRouter.post("/register", (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, phone, password } = parsed.data;
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "E-mail já cadastrado" });
  }
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare(
      "INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)"
    )
    .run(name, email.toLowerCase(), phone ?? null, hash);
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(info.lastInsertRowid) as UserRow;
  return res.status(201).json({ token: sign(user), user: publicUser(user) });
});

authRouter.post("/login", (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.toLowerCase()) as UserRow | undefined;
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
  return res.json({ token: sign(user), user: publicUser(user) });
});

export interface AuthedRequest extends Request {
  user?: UserRow;
}

export function authRequired(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as unknown as {
      sub: number;
    };
    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(payload.sub) as UserRow | undefined;
    if (!user) return res.status(401).json({ error: "Não autenticado" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function adminRequired(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acesso restrito" });
  }
  next();
}

authRouter.get("/me", authRequired, (req: AuthedRequest, res: Response) => {
  return res.json({ user: publicUser(req.user!) });
});

export { publicUser };
