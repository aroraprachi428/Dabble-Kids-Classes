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
const demoSeed = seedDemoUsers().catch((error) => {
  logger.error({ error }, "Unable to seed demo users");
  throw error;
});
app.use(async (req, res, next): Promise<void> => {
  try {
    await demoSeed;
    loadUser(req, res, next);
  } catch {
    res.status(503).json({ error: "Demo data is temporarily unavailable" });
  }
});

app.use("/api", router);

export default app;
