import express from "express";
import cors from "cors";
import { getPackage } from "./package";

/**
 * Bootstrap the application framework
 */
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/package/:name/:version", getPackage);

  return app;
}
