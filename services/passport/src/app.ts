import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { config } from "./config";
import { PassportModel } from "./modules/passport/passport.model";
import { passportRoutes } from "./modules/passport/passport.routes";
import { ApiError } from "./utils/api-error";

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ service: config.serviceName });
});

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
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

async function start() {
  await mongoose.connect(config.mongoUri);
  console.log("passport service connected to mongodb");
  // Reconciles indexes with the current schema so a stale index from a prior
  // schema (e.g. a since-renamed/relocated unique field) doesn't linger and
  // break inserts — Mongoose only adds missing indexes on its own, it never
  // drops obsolete ones.
  await PassportModel.syncIndexes();
  console.log("passport indexes synchronized");
  app.listen(config.port, () => {
    console.log(`${config.serviceName} service running on port ${config.port}`);
  });
}

export { app };

if (require.main === module) {
  start().catch((err) => {
    console.error("failed to start passport service", err);
    process.exit(1);
  });
}
