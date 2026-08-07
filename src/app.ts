import express from "express";
import morganMiddleware from "./config/morganMiddleware";
import Logger from "./lib/logger";
import jobRoleRouter from "./routes/jobRoleRouter";

export const app = express();

app.use(express.json());
app.use(morganMiddleware);
app.use("/jobs", jobRoleRouter);

app.get("/", (_req, res) => {
	Logger.info("Root endpoint accessed");
	res.json({ message: "Welcome to your API!" });
});

app.get("/health", (_req, res) => {
	Logger.info("Health check called");
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;
