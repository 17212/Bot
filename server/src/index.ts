import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router.js";
import { createContext } from "./trpc.js";
import { loadEnv } from "./env.js";

dotenv.config();
const env = loadEnv();

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));

const port = Number(env.PORT || 3000);
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
