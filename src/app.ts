import express from "express";

import {
  authRouter,
  categoriesRouter,
  discountsRouter,
  logsRouter,
  promoCodesRouter,
  productsRouter,
  uploadsRouter,
} from "~modules";

import {
  authenticate,
  errorHandler,
  resolveTenant,
  verifyMembership,
} from "~middleware";

export const app = express();

app.use(express.json());

// Health check — before tenant/auth middleware
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Auth routes — resolveTenant only; logout is protected at the route level
const authApi = express.Router();
authApi.use(resolveTenant);
authApi.use("/", authRouter);
app.use("/api/v1/auth", authApi);

// All /api/v1 routes go through the full pipeline
const api = express.Router();
api.use(resolveTenant);
api.use(authenticate);
api.use(verifyMembership);

app.use("/api/v1", api);

api.use("/categories", categoriesRouter);
api.use("/products", productsRouter);
api.use("/discounts", discountsRouter);
api.use("/promo-codes", promoCodesRouter);
api.use("/uploads", uploadsRouter);
api.use("/logs", logsRouter);

// Global error handler — must be registered LAST
app.use(errorHandler);
