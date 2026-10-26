import { GoogleGenAI } from "@google/genai";
import { extractionSchema, roastSchema, notResumeSchema, normalizeFacts, normalizeRoast, normalizeNotResume } from "./schemas.js";
import { pickVariety } from "./variety.js";
import { EXTRACT_SYSTEM, ROAST_SYSTEM, NOT_RESUME_SYSTEM, extractPrompt, roastPrompt, notResumePrompt } from "./prompts.js";

export function createGeminiProvider({ apiKey, model = "gemini-3.5-flash", client } = {}) {
  const ai = client ?? new GoogleGenAI({ apiKey });

  async function callJson({ label, system, prompt, schema, temperature, normalize }) {
    let lastErr;
    for (let attempt = 1; attempt <= 2; attempt++) {
      let text;
      try {
        const res = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction: system,
            temperature,
            responseMimeType: "application/json",
            responseJsonSchema: schema,
          },
        });
        text = res.text;
        return normalize(JSON.parse(text));
      } catch (err) {
        lastErr = err;
        // Log why, never what: model output can contain resume details.
        const why = typeof err?.status === "number" ? `HTTP ${err.status}: ${String(err.message).slice(0, 300)}` : text === undefined ? String(err?.message).slice(0, 300) : "model returned invalid/malformed JSON";
        console.error(`AI ${label} attempt ${attempt} failed (${model}): ${why}`);
        // Auth, quota and bad-model errors won't fix themselves on an immediate retry.
        if ([400, 401, 403, 404, 429].includes(err?.status)) break;
      }
    }
    const e = new Error("AI call failed");
    e.code = "AI_FAILED";
    e.status = lastErr?.status;
    e.cause = lastErr;
    throw e;
  }

  return {
    name: "gemini",
    extract: (cleanText) =>
      callJson({
        label: "extract",
        system: EXTRACT_SYSTEM,
        prompt: extractPrompt(cleanText),
        schema: extractionSchema,
        temperature: 0,
        normalize: normalizeFacts,
      }),
    roast: (input) =>
      callJson({
        label: "roast",
        system: ROAST_SYSTEM,
        prompt: roastPrompt({ ...input, variety: pickVariety() }),
        schema: roastSchema,
        temperature: 0.9,
        normalize: normalizeRoast,
      }),
    roastNotResume: (input) =>
      callJson({
        label: "not-resume roast",
        system: NOT_RESUME_SYSTEM,
        prompt: notResumePrompt({ ...input, variety: pickVariety() }),
        schema: notResumeSchema,
        temperature: 0.95,
        normalize: normalizeNotResume,
      }),
  };
}
