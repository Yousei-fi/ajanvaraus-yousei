import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

export function signAdminToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET!, { expiresIn: "30d" });
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "missing auth" });
  const token = header.replace(/^Bearer\s+/i, "");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    if ((payload as any).role !== "admin") throw new Error("forbidden");
    next();
  } catch (error) {
    res.status(403).json({ error: "forbidden" });
  }
}
