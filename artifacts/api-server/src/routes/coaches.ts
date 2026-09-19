import { Router, type IRouter } from "express";
import {
  GetCoachParams,
  GetCoachResponse,
  ListCoachesQueryParams,
  ListCoachesResponse,
} from "@workspace/api-zod";
import { coaches } from "../lib/dabble-data";

const router: IRouter = Router();

router.get("/coaches", (req, res): void => {
  const parsed = ListCoachesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid coach search");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q, activity, location, age, day } = parsed.data;
  const terms = [
    q,
    activity,
    location,
    age ? String(age) : undefined,
    day,
  ]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.toLowerCase().split(/\s+/))
    .filter((term) => term.length > 2);

  const ranked = coaches
    .map((coach) => {
      const searchable = [
        coach.name,
        coach.activity,
        coach.venue,
        coach.area,
        coach.ageRange,
        coach.description,
        coach.highlights.join(" "),
        coach.slots.map((slot) => `${slot.day} ${slot.label}`).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const score = terms.reduce(
        (total, term) => total + (searchable.includes(term) ? 1 : 0),
        0,
      );
      return { coach, score };
    })
    .filter(({ score }) => terms.length === 0 || score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.coach.rating - a.coach.rating ||
        b.coach.reviews - a.coach.reviews,
    )
    .map(({ coach }) => coach);

  res.json(ListCoachesResponse.parse(ranked));
});

router.get("/coaches/:coachId", (req, res): void => {
  const parsed = GetCoachParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const coach = coaches.find((item) => item.id === parsed.data.coachId);
  if (!coach) {
    res.status(404).json({ error: "Coach not found" });
    return;
  }

  res.json(GetCoachResponse.parse(coach));
});

export default router;
