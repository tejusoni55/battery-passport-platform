import express from "express";
import { config } from "./config";
import { startConsumer } from "./modules/notification/notification.consumer";
import { notificationRoutes } from "./modules/notification/notification.routes";
import { errorMeta, logger } from "./utils/logger";

const app = express();

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
