import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import { config } from "./config";
import { ensureBucket } from "./config/minio";
import { swaggerSpec } from "./config/swagger";
import { documentRoutes } from "./modules/document/document.routes";
import { ApiError } from "./utils/api-error";
import { errorMeta, logger } from "./utils/logger";

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ service: config.serviceName });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/documents", documentRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File size exceeds 20 MB limit" });
    }
    return res.status(400).json({ message: err.message });
  }
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
  logger.info("document service connected to mongodb");
  await ensureBucket();
  logger.info("document service connected to minio");
  app.listen(config.port, () => {
    logger.info(`${config.serviceName} service running on port ${config.port}`);
  });
}

export { app };

if (require.main === module) {
  start().catch((err) => {
    logger.error("failed to start document service", errorMeta(err));
    process.exit(1);
  });
}
