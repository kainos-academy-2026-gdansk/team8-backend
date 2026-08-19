import express from "express";
import morganMiddleware from "./config/morganMiddleware";
import Logger from "./lib/logger";
import jobRoleRouter from "./routes/jobRoleRouter";
import authRouter from "./routes/authRouter";
import { requireAuth } from "./middleware/requireAuth";
import catalogueRouter from "./routes/catalogueRouter";

export const app = express();

app.use(express.json());
app.use(morganMiddleware);

app.get("/", (_req, res) => {
	Logger.info("Root endpoint accessed");
	res.json({ message: "Welcome to your API!" });
});

app.get("/health", (_req, res) => {
	Logger.info("Health check called");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);

app.use(requireAuth);
app.use("/api", catalogueRouter);
app.use("/api/job-roles", jobRoleRouter);

export default app;
