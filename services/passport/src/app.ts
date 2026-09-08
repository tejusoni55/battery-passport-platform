import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { swaggerSpec } from "./config/swagger";
import { PassportModel } from "./modules/passport/passport.model";
import { passportRoutes } from "./modules/passport/passport.routes";
import { ApiError } from "./utils/api-error";
import { errorMeta, logger } from "./utils/logger";

const app = express();

// Allowlist only: this service's own localhost (dev) and its own public
// Railway URL (via CORS_ALLOWED_ORIGIN), so Swagger UI's "Execute" works
// from wherever /docs itself was loaded — never a wildcard origin.
const allowedOrigins = [`http://localhost:${config.port}`, ...config.corsAllowedOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ service: config.serviceName });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/passports", passportRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }
  if ((err as { type?: string })?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  logger.error("Unhandled error", errorMeta(err));
  return res.status(500).json({ message: "Internal server error" });
});

async function start() {
  await mongoose.connect(config.mongoUri);
  logger.info("passport service connected to mongodb");
  // Reconciles indexes with the current schema so a stale index from a prior
  // schema (e.g. a since-renamed/relocated unique field) doesn't linger and
  // break inserts — Mongoose only adds missing indexes on its own, it never
  // drops obsolete ones.
  await PassportModel.syncIndexes();
  logger.info("passport indexes synchronized");
  app.listen(config.port, () => {
    logger.info(`${config.serviceName} service running on port ${config.port}`);
  });
}

export { app };

if (require.main === module) {
  start().catch((err) => {
    logger.error("failed to start passport service", errorMeta(err));
    process.exit(1);
  });
}
