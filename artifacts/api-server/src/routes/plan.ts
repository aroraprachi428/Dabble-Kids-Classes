import { Router, type IRouter } from "express";
import { catalogExperiences } from "../lib/dabble-data";

const router: IRouter = Router();

router.post("/plan", (req, res): void => {
  const { childAge, budget, monthlyBudget, preferences } = req.body ?? {};
  const effectiveBudget = budget ?? monthlyBudget;
  if (!Number.isInteger(childAge) || childAge < 3 || childAge > 18) {
    res.status(400).json({ error: "childAge must be an integer from 3 to 18" });
    return;
  }
  if (
    budget !== undefined &&
    monthlyBudget !== undefined &&
    budget !== monthlyBudget
  ) {
    res.status(400).json({ error: "budget and monthlyBudget must match when both are provided" });
    return;
  }
  if (effectiveBudget !== undefined && (!Number.isFinite(effectiveBudget) || effectiveBudget <= 0)) {
    res.status(400).json({ error: "budget must be positive when provided" });
    return;
  }
  const preferenceText = typeof preferences === "string" ? preferences.toLowerCase() : "";
  const eligible = catalogExperiences
    .filter((item) => item.ageMin <= childAge && item.ageMax >= childAge)
    .sort((a, b) => {
      const preferred = (item: typeof a) => preferenceText && (item.category + " " + item.title).toLowerCase().includes(preferenceText) ? 1 : 0;
      return preferred(b) - preferred(a) || a.price - b.price || a.id.localeCompare(b.id);
    });
  const chosen: typeof eligible = [];
  const categories = new Set<string>();
  for (const item of eligible) {
    if (categories.has(item.category)) continue;
    if (effectiveBudget !== undefined && (chosen.reduce((sum, current) => sum + current.price * 4, 0) + item.price * 4) > effectiveBudget) continue;
    chosen.push(item); categories.add(item.category);
    if (chosen.length === 4) break;
  }
  if (chosen.length < 2) {
    res.status(400).json({ error: "Monthly budget is too low for two age-appropriate activities" });
    return;
  }
  res.json({
    childAge,
    monthlyTotalEstimate: chosen.reduce((sum, item) => sum + item.price * 4, 0),
    activities: chosen.map((item) => ({
      id: item.id, title: item.title, category: item.category,
      reason: `Age-appropriate ${item.category.toLowerCase()} activity`,
      estimatedMonthlyPrice: item.price * 4,
    })),
  });
});
export default router;