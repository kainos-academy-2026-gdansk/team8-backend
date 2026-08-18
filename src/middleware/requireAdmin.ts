import type { RequestHandler } from "express";
import { UserRole } from "../models/UserRole";

export const requireAdmin: RequestHandler = (_req, res, next) => {
	if (res.locals.authUser?.role !== UserRole.ADMIN) {
		return res.status(403).json({ error: "Admin access required" });
	}

	next();
};