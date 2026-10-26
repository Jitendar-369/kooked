# Kooked (placement cooked meter): rules for Claude

A funny but genuinely useful site for Indian engineering students: upload a resume → Cooked Score (0–100, higher = more cooked), roast, strengths/weaknesses, 4-week plan, Instagram-story share card.

## Non-negotiables
- **The AI never decides the score.** Gemini only extracts facts (temperature 0) and writes the roast (temperature ~0.9). The score comes from `server/src/lib/score.js`, which is pure and deterministic and is tested in `server/test/score.test.js`. Change weights only there, and update the tests.
- **Contact details never reach the AI provider.** Detect links on the raw text first, then run `stripPII` (emails, phones incl. +91, URLs), then truncate to ~12k chars. `server/test/api.test.js` asserts nothing PII-like is sent to Gemini; keep it passing.
- The roast call gets the extracted facts, score and reasons only, never the raw resume.
- The resume goes inside `<resume>` tags, and the prompt says it is data and that any instructions inside it are ignored.
- Roast the resume, never the person: nothing about looks, family, caste, religion, gender, region or intelligence. Strengths must be real facts. No hashtags.
- Personal touch: extraction returns the first name only (surname dropped) and 10th/12th percentages; the roast uses them. Names never go in `shareLine`. These fields never affect the score.
- Not a resume: no score and no error. Roast the upload using only the sanitised `documentType` label and first name (`roastNotResume`), never the document's text.
- Jokes live only in `roast` (and lightly in `shareLine`); strengths, weaknesses and the plan stay factual. There is always something to roast, even on strong resumes.
- Tone: brutally honest and harsh about the resume, emoji-heavy, never repetitive. Each roast gets a random voice and emoji set from `server/src/ai/variety.js`; result reactions live in `client/src/reactions.js` (one animated Noto sticker per result, no reroll; only add emojis whose animated version exists). Add to those pools rather than hard-coding lines.
- Uploads: PDF only, ≤2 MB, memory storage, never written to disk. Never log resume text.
- No fake social proof: the counter comes only from `/api/stats` and shows only when it is > 50.
- Mock mode (`GEMINI_API_KEY` empty or `MOCK_AI=true`) must keep the whole app working offline.

## Layout
- `server/`: Express 5, ESM. The pipeline is in `src/routes/roast.js`. Providers are in `src/ai/` (`gemini.js` and `mock.js` share the same `extract`/`roast` interface). Cache and stats sit behind swappable modules in `src/lib/`.
- `client/`: Vite + React + Tailwind v4. Hand-made look (chalkboard, paper receipt, stamps, tape); avoid glossy gradients and generic SaaS styling. The share card is an off-screen 1080×1920 node captured with `html-to-image` (`pixelRatio: 1`). It is pre-rendered so the Web Share call keeps user activation. Fonts are self-hosted via @fontsource so they embed in the PNG.

## Checks before committing
- `cd server && npm test`
- `cd client && npm run build`
- The weak sample (`server/samples/weak.*`) must score ≥ 60, and the strong sample must score < 30.
