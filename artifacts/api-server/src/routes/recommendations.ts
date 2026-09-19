import { Router, type IRouter } from "express";
import {
  RecommendClassesBody,
  RecommendClassesResponse,
} from "@workspace/api-zod";
import {
  catalogExperiences,
  coaches,
  type Coach,
} from "../lib/dabble-data";

type Intent = {
  activity: string;
  childAge: number | null;
  level: string;
  area: string;
  day: string;
  timeOfDay: string;
  maxPrice: number | null;
  society: string;
  formatPreference: string;
  venuePreference: string;
  ageNote: string;
};

type RecommendationResult = {
  id: string;
  matchScore: number;
  reason: string;
};

type RecommendationResponse = {
  intent: Intent;
  results: RecommendationResult[];
};

const router: IRouter = Router();

const activityNames = [
  ...new Set([
    ...catalogExperiences.map((experience) => experience.category),
    "Swimming",
    "Football",
    "Art",
    "Tennis",
    "Skating",
    "Chess",
    "Music",
    "Dance",
    "Coding",
    "Robotics",
  ]),
];
const areaNames = [...new Set(coaches.map((coach) => coach.area))];
const dayAliases: Record<string, string> = {
  monday: "Monday",
  mon: "Monday",
  tuesday: "Tuesday",
  tue: "Tuesday",
  wednesday: "Wednesday",
  wed: "Wednesday",
  thursday: "Thursday",
  thu: "Thursday",
  friday: "Friday",
  fri: "Friday",
  saturday: "Saturday",
  sat: "Saturday",
  sunday: "Sunday",
  sun: "Sunday",
  weekend: "Weekend",
  weekends: "Weekend",
  weekday: "Weekday",
  weekdays: "Weekday",
};

const nearbyAreas: Record<string, string[]> = {
  Whitefield: ["Bellandur", "Sarjapur Road"],
  "Sarjapur Road": ["Bellandur", "HSR Layout", "Whitefield", "Koramangala"],
  Bellandur: ["Sarjapur Road", "HSR Layout", "Whitefield", "Koramangala"],
  "HSR Layout": ["Koramangala", "Bellandur", "Sarjapur Road"],
  Koramangala: ["HSR Layout", "Indiranagar", "Jayanagar", "Sarjapur Road"],
  Indiranagar: ["Koramangala", "Whitefield"],
  Jayanagar: ["Koramangala", "HSR Layout"],
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9₹\s-]/g, " ").replace(/\s+/g, " ").trim();

function parseIntent(query: string): Intent {
  const normalized = normalize(query);
  const ageMatch = normalized.match(
    /(?:age(?:d)?\s*)?(\d{1,2})\s*(?:year|yr)[ -]?(?:old)?|age\s*(\d{1,2})\b/,
  );
  const priceMatch =
    normalized.match(
      /(?:under|below|within|max(?:imum)?|budget(?:\s+of)?)\s*(?:₹|rs\.?|inr|rupees?)?\s*(\d{2,5})/,
    ) ??
    normalized.match(/(?:₹|rs\.?|inr)\s*(\d{2,5})/);
  const activity =
    activityNames
      .sort((a, b) => b.length - a.length)
      .find((name) => normalized.includes(name.toLowerCase())) ?? "";
  const area =
    areaNames.find((name) => normalized.includes(name.toLowerCase())) ??
    catalogExperiences.flatMap((e) => e.serviceAreas).find((name) => normalized.includes(name.toLowerCase())) ?? "";
  const society = catalogExperiences.map((e) => e.nearSociety).find((name) => normalized.includes(name.toLowerCase())) ?? "";
  const formatPreference = normalized.includes("private") || normalized.includes("one on one") ? "private" : normalized.includes("group") ? "group" : "";
  const venuePreference = normalized.includes("online") ? "online" : normalized.includes("come to") || normalized.includes("society") || normalized.includes("home") ? "comes_to_your_society" : normalized.includes("studio") ? "at_studio" : "";
  const dayKey = Object.keys(dayAliases).find((key) =>
    new RegExp(`\\b${key}\\b`).test(normalized),
  );
  const level =
    ["beginner", "intermediate", "advanced"].find((value) =>
      normalized.includes(value),
    ) ?? "";
  const timeOfDay =
    ["morning", "afternoon", "evening"].find((value) =>
      normalized.includes(value),
    ) ?? "";

  return {
    activity,
    childAge: ageMatch ? Number(ageMatch[1] ?? ageMatch[2]) : null,
    level,
    area,
    day: dayKey ? dayAliases[dayKey] : "",
    timeOfDay,
    maxPrice: priceMatch ? Number(priceMatch[1]) : null,
    society,
    formatPreference,
    venuePreference,
    ageNote: "",
  };
}

function ageFits(coach: Coach, age: number | null) {
  if (age === null) return true;
  const experience = catalogExperiences.find((item) => item.id === coach.id);
  return experience ? age >= experience.ageMin && age <= experience.ageMax : false;
}

function dayFits(coach: Coach, day: string) {
  if (!day) return true;
  const slotText = coach.slots
    .map((slot) => `${slot.day} ${slot.label}`)
    .join(" ")
    .toLowerCase();
  if (day === "Weekend") {
    return /sat|sun|weekend/.test(slotText);
  }
  if (day === "Weekday") {
    return /mon|tue|wed|thu|fri|weekday/.test(slotText);
  }
  return slotText.includes(day.slice(0, 3).toLowerCase());
}

function buildReason(coach: Coach, intent: Intent) {
  const childReference =
    intent.childAge !== null
      ? `your ${intent.childAge}-year-old`
      : "your child";
  const locationReference = intent.society
    ? `near ${intent.society}`
    : intent.area
    ? intent.area === coach.area
      ? `right in ${intent.area}`
      : `with ${intent.area} as your preferred area`
    : intent.maxPrice !== null
      ? `within your ₹${intent.maxPrice} budget`
      : intent.day
        ? `for your ${intent.day.toLowerCase()} preference`
        : "with a flexible Bangalore service area";
  return `${coach.name}'s warm, vetted ${coach.activity.toLowerCase()} class is age-appropriate for ${childReference} and fits ${locationReference}.`;
}

function localRecommend(query: string): RecommendationResponse {
  const intent = parseIntent(query);
  const normalized = normalize(query);
  const terms = normalized.split(" ").filter((term) => term.length > 2);

  const eligible = coaches.filter((coach) => ageFits(coach, intent.childAge));
  const results = eligible
    .map((coach) => {
      const searchable = normalize(
        [
          coach.activity,
          coach.name,
          coach.venue,
          coach.area,
          coach.ageRange,
          coach.description,
          coach.highlights.join(" "),
        ].join(" "),
      );
      const keywordMatches = terms.filter((term) =>
        searchable.includes(term),
      ).length;
      let score = 42 + Math.min(keywordMatches * 4, 16);

      if (intent.activity) {
        const activityMatches = normalize(
          `${coach.activity} ${coach.highlights.join(" ")}`,
        ).includes(normalize(intent.activity));
        score += activityMatches ? 26 : -10;
      }
      if (intent.area) {
        const experience = catalogExperiences.find((item) => item.id === coach.id);
        if (coach.area === intent.area || experience?.serviceAreas.includes(intent.area)) score += 34;
        else if (nearbyAreas[intent.area]?.includes(coach.area)) score += 16;
        else score -= 14;
      }
      if (intent.society) {
        const experience = catalogExperiences.find((item) => item.id === coach.id);
        score += experience?.nearSociety.toLowerCase() === intent.society.toLowerCase() ? 38 : -8;
      }
      if (intent.formatPreference || intent.venuePreference) {
        const experience = catalogExperiences.find((item) => item.id === coach.id);
        if (intent.formatPreference && experience?.sessionFormats.includes(intent.formatPreference)) score += 12;
        if (intent.venuePreference && experience?.venueType === intent.venuePreference) score += 12;
      }
      if (intent.childAge !== null) {
        const isForChildren =
          coach.ageRange !== "All ages" ||
          coach.highlights.some((item) => item.toLowerCase() === "kids");
        score +=
          isForChildren && ageFits(coach, intent.childAge)
            ? 18
            : isForChildren
              ? -25
              : -42;
      }
      if (intent.day) score += dayFits(coach, intent.day) ? 8 : -8;
      if (intent.timeOfDay) {
        const hasTime = coach.slots.some((slot) =>
          slot.label.toLowerCase().includes(intent.timeOfDay.toLowerCase()),
        );
        score += hasTime ? 5 : -3;
      }
      if (intent.maxPrice !== null) {
        score += coach.price <= intent.maxPrice ? 8 : -12;
      }

      return {
        id: coach.id,
        matchScore: Math.max(35, Math.min(98, Math.round(score))),
        reason: buildReason(coach, intent),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);

  if (intent.childAge !== null && intent.childAge <= 5) {
    results.sort((a, b) => {
      const ap = catalogExperiences.find((e) => e.id === a.id)?.parentAccompanied ? 1 : 0;
      const bp = catalogExperiences.find((e) => e.id === b.id)?.parentAccompanied ? 1 : 0;
      return bp - ap || b.matchScore - a.matchScore;
    });
  }
  const ageNote = intent.childAge !== null && results.length < 5
    ? `We found ${results.length} safe age-matched option${results.length === 1 ? "" : "s"}; we won't suggest classes outside your child's age range.`
    : "";
  return RecommendClassesResponse.parse({ intent: { ...intent, ageNote }, results });
}

const systemPrompt = `You recommend children's classes to parents in Bangalore.
Return ONLY valid JSON with exactly this shape and no markdown:
{"intent":{"activity":"","childAge":null,"level":"","area":"","day":"","timeOfDay":"","maxPrice":null,"society":"","formatPreference":"","venuePreference":"","ageNote":""},"results":[{"id":"","matchScore":0,"reason":""}]}

Rules:
- ONLY use ids that exist in the provided catalog. Never invent an id, class, coach, venue, slot, price, or detail.
- Return up to 8 unique results; never return an offer outside the requested age range.
- matchScore must be an integer from 0 through 100.
- Weight geographic proximity to the parent's mentioned area heavily.
- Every reason must be exactly one warm, friendly sentence.
- Every reason must explicitly reference the child's age when supplied, and the parent's area or another stated constraint.
- Use empty strings and nulls exactly as shown when intent is unknown.`;

function validateLlmResponse(value: unknown, expectedAge: number | null = null): RecommendationResponse {
  const parsed = RecommendClassesResponse.parse(value);
  const childAge = expectedAge ?? parsed.intent.childAge;
  const catalogIds = new Set(
    catalogExperiences.map((experience) => experience.id),
  );
  const seen = new Set<string>();

  for (const result of parsed.results) {
    if (!catalogIds.has(result.id) || seen.has(result.id)) {
      throw new Error("LLM returned an invalid or duplicate catalog id");
    }
    seen.add(result.id);
    const experience = catalogExperiences.find((item) => item.id === result.id);
    if (childAge !== null && experience &&
      (childAge < experience.ageMin || childAge > experience.ageMax)) {
      throw new Error("LLM returned an age-incompatible recommendation");
    }
  }

  return {
    ...parsed,
    intent: { ...parsed.intent, childAge },
    results: [...parsed.results].sort((a, b) => b.matchScore - a.matchScore),
  };
}

async function recommendWithGemini(apiKey: string, query: string): Promise<RecommendationResponse> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nParent request:\n${query}\n\nFull enhanced catalog:\n${JSON.stringify(catalogExperiences)}` }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!response.ok) throw new Error(`Gemini request failed with status ${response.status}`);
  const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");
  return validateLlmResponse(parseJsonText(text), parseIntent(query).childAge);
}

function parseJsonText(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(trimmed) as unknown;
}

async function recommendWithAnthropic(
  apiKey: string,
  query: string,
): Promise<RecommendationResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Parent request:\n${query}\n\nFull catalog:\n${JSON.stringify(catalogExperiences)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const text = payload.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned no text");
  return validateLlmResponse(parseJsonText(text), parseIntent(query).childAge);
}

async function recommendWithOpenAI(
  apiKey: string,
  query: string,
): Promise<RecommendationResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Parent request:\n${query}\n\nFull catalog:\n${JSON.stringify(catalogExperiences)}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned no text");
  return validateLlmResponse(parseJsonText(text), parseIntent(query).childAge);
}

router.post("/recommend", async (req, res): Promise<void> => {
  const parsed = RecommendClassesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { query } = parsed.data;

  try {
    let recommendations: RecommendationResponse;
    if (process.env.GEMINI_API_KEY) {
      recommendations = await recommendWithGemini(process.env.GEMINI_API_KEY, query);
    } else if (process.env.ANTHROPIC_API_KEY) {
      recommendations = await recommendWithAnthropic(
        process.env.ANTHROPIC_API_KEY,
        query,
      );
    } else if (process.env.OPENAI_API_KEY) {
      recommendations = await recommendWithOpenAI(
        process.env.OPENAI_API_KEY,
        query,
      );
    } else {
      recommendations = localRecommend(query);
    }
    res.json(recommendations);
  } catch (error) {
    req.log.warn(
      { err: error instanceof Error ? error.message : "Unknown AI error" },
      "AI recommendation failed; using deterministic fallback",
    );
    res.json(localRecommend(query));
  }
});

export default router;
