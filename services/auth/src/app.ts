import express, { NextFunction, Request, Response } from "express";
import { config } from "./config";
import { connectDatabase } from "./config/db";
import { authRoutes } from "./modules/auth/auth.routes";
import { ApiError } from "./utils/api-error";

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ service: config.serviceName });
});

app.use("/api/auth", authRoutes);

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
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

async function start() {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`${config.serviceName} service running on port ${config.port}`);
  });
}

export { app };

if (require.main === module) {
  start().catch((err) => {
    console.error("failed to start auth service", err);
    process.exit(1);
  });
}
