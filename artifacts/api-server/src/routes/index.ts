import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coachesRouter from "./coaches";
import bookingsRouter from "./bookings";
import recommendationsRouter from "./recommendations";
import paymentsRouter from "./payments";
import authRouter from "./auth";
import accountRouter from "./account";
import planRouter from "./plan";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coachesRouter);
router.use(bookingsRouter);
router.use(recommendationsRouter);
router.use(paymentsRouter);
router.use(authRouter);
router.use(accountRouter);
router.use(planRouter);

export default router;
