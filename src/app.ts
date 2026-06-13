import express from "express";
import {
  errorHandler,
  resolveTenant,
  authenticate,
  verifyMembership,
} from "./middleware";

export const app = express();

app.use(express.json());

// Health check — before tenant/auth middleware
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// All /api/v1 routes go through the standard pipeline.
// Route modules from Tickets 04-07 will be mounted here.
const api = express.Router();
api.use(resolveTenant);
api.use(authenticate);
api.use(verifyMembership);

// TODO: mount route modules here in later tickets
// api.use("/categories", categoriesRouter);

app.use("/api/v1", api);

// Global error handler — must be registered LAST
app.use(errorHandler);
