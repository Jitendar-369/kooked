import { GoogleGenAI } from "@google/genai";
import { extractionSchema, roastSchema, notResumeSchema, normalizeFacts, normalizeRoast, normalizeNotResume } from "./schemas.js";
import { pickVariety } from "./variety.js";
import { EXTRACT_SYSTEM, ROAST_SYSTEM, NOT_RESUME_SYSTEM, extractPrompt, roastPrompt, notResumePrompt } from "./prompts.js";

export function createGeminiProvider({ apiKey, model = "gemini-3.5-flash", client } = {}) {
  const ai = client ?? new GoogleGenAI({ apiKey });

  async function callJson({ system, prompt, schema, temperature, normalize }) {
    let lastErr;
    for (let attempt = 0; attempt < 2; attempt++) {
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
        return normalize(JSON.parse(res.text));
      } catch (err) {
        lastErr = err;
      }
    }
    const e = new Error("AI call failed");
    e.code = "AI_FAILED";
    e.cause = lastErr;
    throw e;
  }

  return {
    name: "gemini",
    extract: (cleanText) =>
      callJson({
        system: EXTRACT_SYSTEM,
        prompt: extractPrompt(cleanText),
        schema: extractionSchema,
        temperature: 0,
        normalize: normalizeFacts,
      }),
    roast: (input) =>
      callJson({
        system: ROAST_SYSTEM,
        prompt: roastPrompt({ ...input, variety: pickVariety() }),
        schema: roastSchema,
        temperature: 0.9,
        normalize: normalizeRoast,
      }),
    roastNotResume: (input) =>
      callJson({
        system: NOT_RESUME_SYSTEM,
        prompt: notResumePrompt({ ...input, variety: pickVariety() }),
        schema: notResumeSchema,
        temperature: 0.95,
        normalize: normalizeNotResume,
      }),
  };
}
