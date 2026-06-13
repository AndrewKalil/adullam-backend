import express from "express";

export const app = express();

// Parse JSON request bodies
app.use(express.json());

// Health check — no auth, no tenant context
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
