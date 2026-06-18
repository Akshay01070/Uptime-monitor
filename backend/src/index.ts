import express from "express";
import { initializeDatabase } from "./database/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import urlsRouter from "./routes/urls.js";
import { startMonitorWorker } from "./workers/monitorWorker.js";

initializeDatabase();
startMonitorWorker();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.options("*", (_req, res) => {
  res.sendStatus(204);
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/urls", urlsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
