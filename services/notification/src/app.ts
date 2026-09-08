import cors from "cors";
import express from "express";
import { config } from "./config";
import { startConsumer } from "./modules/notification/notification.consumer";
import { notificationRoutes } from "./modules/notification/notification.routes";
import { errorMeta, logger } from "./utils/logger";

const app = express();

// Allowlist only: this service's own localhost (dev) and its own public
// Railway URL (via CORS_ALLOWED_ORIGIN) — kept consistent with the other
// three services even though this one has no Swagger UI.
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
app.use(notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

async function start() {
  await startConsumer();
  logger.info("notification service consumer started");
  app.listen(config.port, () => {
    logger.info(`${config.serviceName} service running on port ${config.port}`);
  });
}

export { app };

if (require.main === module) {
  start().catch((err) => {
    logger.error("failed to start notification service", errorMeta(err));
    process.exit(1);
  });
}
