import type { RequestHandler } from "express";
import { getSessionUser } from "../lib/auth";

declare global {
  namespace Express { interface Request { user?: import("@workspace/db").User } }
}

export const loadUser: RequestHandler = async (req, _res, next) => {
  req.user = (await getSessionUser(req.headers.cookie)) ?? undefined;
  next();
};
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.user) { res.status(401).json({ error: "Authentication required" }); return; }
  next();
};
export const requireRole = (...roles: Array<"parent" | "coach" | "employee">): RequestHandler => (req, res, next) => {
  if (!req.user) { res.status(401).json({ error: "Authentication required" }); return; }
  if (!roles.includes(req.user.role)) { res.status(403).json({ error: "Forbidden" }); return; }
  next();
};