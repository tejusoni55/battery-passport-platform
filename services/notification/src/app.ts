import express from "express";
import { config } from "./config";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ service: config.serviceName });
});

app.listen(config.port, () => {
  console.log(`${config.serviceName} service running on port ${config.port}`);
});
