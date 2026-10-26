import { test } from "node:test";
import assert from "node:assert/strict";
import { mockRoast } from "../src/ai/mock.js";
import { pickVariety, STYLES } from "../src/ai/variety.js";
import { roastPrompt } from "../src/ai/prompts.js";
import { scoreResume } from "../src/lib/score.js";

const facts = {
  looksLikeResume: true,
  cgpa: 6.5,
  skills: ["HTML", "CSS"],
  projects: [{ name: "Calculator", isBasic: true }],
  internships: 0,
  achievements: [],
  hasDsa: false,
};
const scored = scoreResume(facts, {});

test("mock roasts vary between runs", () => {
  const roasts = new Set(Array.from({ length: 30 }, () => mockRoast({ facts, ...scored }).roast));
  assert.ok(roasts.size >= 10, `only ${roasts.size} distinct roasts`);
});

test("mock roast never repeats an emoji and stays valid", () => {
  const emoji = /\p{Extended_Pictographic}/gu;
  for (let i = 0; i < 50; i++) {
    const r = mockRoast({ facts, ...scored });
    const used = r.roast.match(emoji) ?? [];
    assert.equal(new Set(used).size, used.length, r.roast);
    assert.ok(used.length >= 3, r.roast);
    assert.ok(r.shareLine.length < 90);
    assert.equal(r.actionPlan.length, 4);
  }
});

test("variety picks a style and 15 emojis; roast prompt carries them", () => {
  const v = pickVariety();
  assert.ok(STYLES.includes(v.style));
  assert.equal(v.emojis.length, 15);
  const prompt = JSON.parse(roastPrompt({ facts, links: {}, ...scored, variety: v }));
  assert.equal(prompt.style, v.style);
  assert.deepEqual(prompt.emojis, v.emojis);
  assert.equal(prompt.facts.looksLikeResume, undefined);
});
