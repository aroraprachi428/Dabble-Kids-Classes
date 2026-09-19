import assert from "node:assert/strict";
import http from "node:http";
import { after, before, beforeEach, test } from "node:test";
import express from "express";
import recommendationsRouter from "../src/routes/recommendations";
import { catalogExperiences } from "../src/lib/dabble-data";

type RecommendationResponse = {
  intent: {
    activity: string;
    childAge: number | null;
    level: string;
    area: string;
    day: string;
    timeOfDay: string;
    maxPrice: number | null;
  };
  results: Array<{ id: string; matchScore: number; reason: string }>;
};

const originalFetch = globalThis.fetch;
const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
const originalOpenAIKey = process.env.OPENAI_API_KEY;
const catalogIds = new Set(catalogExperiences.map(({ id }) => id));
const validResults = catalogExperiences
  .filter(({ ageMin, ageMax }) => ageMin <= 8 && ageMax >= 8)
  .slice(0, 5)
  .map(({ id }, index) => ({
    id,
    matchScore: 95 - index,
    reason: `Catalog match ${index + 1}.`,
  }));
const providerIntent = {
  activity: "Swimming",
  childAge: 8,
  level: "beginner",
  area: "Whitefield",
  day: "Saturday",
  timeOfDay: "morning",
  maxPrice: 800,
  society: "",
  formatPreference: "",
  venuePreference: "",
  ageNote: "",
};

let server: http.Server;
let port: number;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.log = {
      warn() {},
    } as typeof req.log;
    next();
  });
  app.use(recommendationsRouter);

  server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address === "object");
  port = address.port;
});

after(async () => {
  globalThis.fetch = originalFetch;
  restoreEnv("GEMINI_API_KEY", originalGeminiKey);
  restoreEnv("ANTHROPIC_API_KEY", originalAnthropicKey);
  restoreEnv("OPENAI_API_KEY", originalOpenAIKey);
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

beforeEach(() => {
  delete process.env.GEMINI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  globalThis.fetch = originalFetch;
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}

function assertSafeResponse(response: RecommendationResponse) {
  assert(response.results.length >= 5 && response.results.length <= 8);
  assert.equal(
    new Set(response.results.map(({ id }) => id)).size,
    response.results.length,
  );
  for (const result of response.results) {
    assert.match(result.id, /^exp-/);
    assert(catalogIds.has(result.id), `${result.id} is not in the catalog`);
    assert(Number.isInteger(result.matchScore));
    assert(result.matchScore >= 0 && result.matchScore <= 100);
  }
}

async function postRecommendation(query: string) {
  const body = JSON.stringify({ query });
  return new Promise<RecommendationResponse>((resolve, reject) => {
    const request = http.request(
      {
        host: "127.0.0.1",
        port,
        path: "/recommend",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
      },
      (response) => {
        let text = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          text += chunk;
        });
        response.on("end", () => {
          try {
            assert.equal(response.statusCode, 200);
            resolve(JSON.parse(text) as RecommendationResponse);
          } catch (error) {
            reject(error);
          }
        });
      },
    );
    request.on("error", reject);
    request.end(body);
  });
}

function mockProviderResponse(payload: unknown, status = 200) {
  globalThis.fetch = async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    });
}

// Safeguard: valid Anthropic output is accepted without contacting the real provider.
test("accepts a valid Anthropic catalog response without calling the real provider", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  mockProviderResponse({
    content: [
      {
        type: "text",
        text: JSON.stringify({ intent: providerIntent, results: validResults }),
      },
    ],
  });

  const response = await postRecommendation("football in Koramangala");

  assert.deepEqual(response.results, validResults);
  assertSafeResponse(response);
});

// Safeguard: valid OpenAI output remains catalog-safe and deterministically sorted.
test("accepts and score-sorts a valid OpenAI catalog response", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  const unsortedResults = [...validResults].reverse();
  mockProviderResponse({
    choices: [
      {
        message: {
          content: JSON.stringify({
            intent: providerIntent,
            results: unsortedResults,
          }),
        },
      },
    ],
  });

  const response = await postRecommendation("football in Koramangala");

  assertSafeResponse(response);
});

// Safeguard: non-parseable provider JSON triggers the local fallback.
test("falls back when Anthropic returns malformed JSON", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  mockProviderResponse({
    content: [{ type: "text", text: "not valid json" }],
  });

  const response = await postRecommendation(
    "Beginner swimming for my 8 year old in Whitefield on Saturday morning under ₹800",
  );

  assertSafeResponse(response);
});

// Safeguard: provider JSON that violates the response schema triggers the local fallback.
test("falls back when OpenAI returns schema-invalid JSON", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  mockProviderResponse({
    choices: [
      {
        message: {
          content: JSON.stringify({
            intent: providerIntent,
            results: [
              {
                id: validResults[0].id,
                matchScore: 101,
                reason: "Score is outside the allowed range.",
              },
            ],
          }),
        },
      },
    ],
  });

  const response = await postRecommendation(
    "Beginner swimming for my 8 year old in Whitefield on Saturday morning under ₹800",
  );

  assertSafeResponse(response);
});

// Safeguard: hallucinated catalog IDs are rejected and replaced by local results.
test("rejects an invented catalog ID and falls back locally", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  mockProviderResponse({
    choices: [
      {
        message: {
          content: JSON.stringify({
            intent: providerIntent,
            results: [
              ...validResults.slice(0, 4),
              { id: "exp-invented", matchScore: 90, reason: "Invented." },
            ],
          }),
        },
      },
    ],
  });

  const response = await postRecommendation(
    "Beginner swimming for my 8 year old in Whitefield on Saturday morning under ₹800",
  );

  assertSafeResponse(response);
});

// Safeguard: duplicate provider IDs are rejected and replaced by unique local results.
test("rejects duplicate catalog IDs and falls back locally", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  mockProviderResponse({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          intent: providerIntent,
          results: [...validResults.slice(0, 4), validResults[0]],
        }),
      },
    ],
  });

  const response = await postRecommendation(
    "Beginner swimming for my 8 year old in Whitefield on Saturday morning under ₹800",
  );

  assertSafeResponse(response);
});

// Safeguard: a non-200 provider response triggers the local fallback.
test("falls back when Anthropic returns a non-200 response", async () => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  mockProviderResponse({ error: "unavailable" }, 503);

  const response = await postRecommendation("tennis in Bellandur");

  assertSafeResponse(response);
});

// Safeguard: a thrown provider error triggers the local fallback without escaping.
test("falls back when OpenAI throws", async () => {
  process.env.OPENAI_API_KEY = "test-key";
  globalThis.fetch = async () => {
    throw new Error("network failure");
  };

  const response = await postRecommendation("football in Koramangala");

  assertSafeResponse(response);
});

// Safeguard: missing provider secrets use deterministic local results without a fetch.
test("uses deterministic fallback when provider secrets are missing", async () => {
  globalThis.fetch = async () => {
    throw new Error("provider fetch must not be called without a secret");
  };
  const query =
    "Beginner swimming for my 8 year old in Whitefield on Saturday morning under ₹800";

  const first = await postRecommendation(query);
  const second = await postRecommendation(query);

  assert.deepEqual(first, second);
  assertSafeResponse(first);
});
