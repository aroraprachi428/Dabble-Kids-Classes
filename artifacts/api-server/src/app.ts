import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { loadUser } from "./middleware/auth";
import { seedDemoUsers } from "./lib/auth";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigin = process.env.APP_ORIGIN;
app.use(cors({ origin: allowedOrigin ?? true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
void seedDemoUsers().catch((error) => {
  logger.error({ error }, "Unable to seed demo users");
});

// Keep the deployment health check independent from optional demo-data seeding.
// A seed failure should not take the static web app or public API offline.
app.get("/api", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res, next): void => {
  loadUser(req, res, next);
});

app.use("/api", router);

export default app;
