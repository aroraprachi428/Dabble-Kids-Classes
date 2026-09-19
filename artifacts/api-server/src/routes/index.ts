import { Router, type IRouter } from "express";
import healthRouter from "./health";
import coachesRouter from "./coaches";
import bookingsRouter from "./bookings";
import recommendationsRouter from "./recommendations";

const router: IRouter = Router();

router.use(healthRouter);
router.use(coachesRouter);
router.use(bookingsRouter);
router.use(recommendationsRouter);

export default router;
