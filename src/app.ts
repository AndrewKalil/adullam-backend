import express from "express";

import { categoriesRouter, discountsRouter, promoCodesRouter, productsRouter } from "~modules";

import {
  errorHandler,
  resolveTenant,
  authenticate,
  verifyMembership,
} from "~middleware";

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

app.use("/api/v1", api);

api.use("/categories", categoriesRouter);
api.use("/products", productsRouter);
api.use("/discounts", discountsRouter);
api.use("/promo-codes", promoCodesRouter);

// Global error handler — must be registered LAST
app.use(errorHandler);
