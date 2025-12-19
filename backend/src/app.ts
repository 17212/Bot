import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router.js";
import { createContext } from "./trpc.js";
import { loadEnv } from "./env.js";

export function createApp() {
  const env = loadEnv();

  const app = express();
  app.use(cors());
  app.use(bodyParser.json({ limit: "1mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", env: env.NODE_ENV });
  });

  app.use("/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  return app;
}
