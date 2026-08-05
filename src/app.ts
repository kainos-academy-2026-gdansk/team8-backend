import express from "express";

export const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
	res.json({ message: "Welcome to your API!" });
});

app.get("/health", (_req, res) => {
	res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default app;
