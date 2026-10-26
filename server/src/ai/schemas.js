export const extractionSchema = {
  type: "object",
  properties: {
    looksLikeResume: { type: "boolean" },
    documentType: { type: "string", description: "What this document actually is, in 1-4 words (e.g. 'resume', 'electricity bill', 'lecture notes', 'meme')." },
    firstName: { type: ["string", "null"], description: "Candidate's first name only, or null." },
    class10Percent: { type: ["number", "null"], description: "10th / SSC / matric score as a percentage (convert CGPA x 9.5), or null." },
    class12Percent: { type: ["number", "null"], description: "12th / HSC / intermediate / diploma score as a percentage, or null." },
    cgpa: { type: ["number", "null"], description: "On a 10-point scale. Convert percentage by dividing by 9.5. null if absent." },
    skills: { type: "array", items: { type: "string" } },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, isBasic: { type: "boolean" } },
        required: ["name", "isBasic"],
      },
    },
    internships: { type: "integer", minimum: 0 },
    achievements: { type: "array", items: { type: "string" } },
    hasDsa: { type: "boolean" },
  },
  required: ["looksLikeResume", "documentType", "firstName", "class10Percent", "class12Percent", "cgpa", "skills", "projects", "internships", "achievements", "hasDsa"],
};

export const notResumeSchema = {
  type: "object",
  properties: {
    roast: { type: "string", description: "4-5 savage lines with 4-8 varied emojis" },
    shareLine: { type: "string", maxLength: 90 },
  },
  required: ["roast", "shareLine"],
};

export const roastSchema = {
  type: "object",
  properties: {
    roast: { type: "string", description: "4-5 savage lines, each a specific jab, 4-8 varied emojis" },
    shareLine: { type: "string", maxLength: 90 },
    strengths: { type: "array", items: { type: "string" }, maxItems: 3 },
    weaknesses: { type: "array", items: { type: "string" }, maxItems: 3 },
    actionPlan: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: { week: { type: "integer" }, task: { type: "string" } },
        required: ["week", "task"],
      },
    },
  },
  required: ["roast", "shareLine", "strengths", "weaknesses", "actionPlan"],
};

// Validate/normalise model output so a slightly-off response doesn't leak into scoring.
export function normalizeFacts(f) {
  if (!f || typeof f !== "object" || typeof f.looksLikeResume !== "boolean") throw new Error("bad extraction");
  const strs = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim()) : []);
  let cgpa = typeof f.cgpa === "number" && Number.isFinite(f.cgpa) ? f.cgpa : null;
  if (cgpa !== null && cgpa > 10 && cgpa <= 100) cgpa = cgpa / 9.5;
  if (cgpa !== null && (cgpa < 0 || cgpa > 10)) cgpa = null;
  if (cgpa !== null) cgpa = Math.round(cgpa * 100) / 100;
  const pct = (v) => (typeof v === "number" && Number.isFinite(v) && v > 0 && v <= 100 ? Math.round(v * 10) / 10 : null);
  // First name only: one word, letters only, sane length. Anything else is dropped.
  const firstName = typeof f.firstName === "string" ? f.firstName.trim().split(/\s+/)[0] : "";
  const docType = typeof f.documentType === "string" ? f.documentType.replace(/[^\p{L}\p{N} &'-]/gu, "").trim().slice(0, 40) : "";
  return {
    looksLikeResume: f.looksLikeResume,
    documentType: docType || (f.looksLikeResume ? "resume" : "mystery document"),
    firstName: /^\p{L}[\p{L}'-]{0,19}$/u.test(firstName) ? firstName[0].toUpperCase() + firstName.slice(1).toLowerCase() : null,
    class10Percent: pct(f.class10Percent),
    class12Percent: pct(f.class12Percent),
    cgpa,
    skills: strs(f.skills),
    projects: (Array.isArray(f.projects) ? f.projects : [])
      .filter((p) => p && typeof p.name === "string" && p.name.trim())
      .map((p) => ({ name: p.name.trim(), isBasic: Boolean(p.isBasic) })),
    internships: Number.isInteger(f.internships) && f.internships >= 0 ? f.internships : 0,
    achievements: strs(f.achievements),
    hasDsa: Boolean(f.hasDsa),
  };
}

export function normalizeNotResume(r) {
  if (!r || typeof r.roast !== "string" || typeof r.shareLine !== "string") throw new Error("bad roast");
  let shareLine = r.shareLine.trim();
  if (shareLine.length > 90) shareLine = shareLine.slice(0, 87).trimEnd() + "…";
  return { roast: r.roast.trim(), shareLine };
}

export function normalizeRoast(r) {
  if (!r || typeof r.roast !== "string" || typeof r.shareLine !== "string") throw new Error("bad roast");
  const strs = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === "string").slice(0, 3) : []);
  const plan = Array.isArray(r.actionPlan) ? r.actionPlan.filter((s) => s && typeof s.task === "string") : [];
  if (plan.length < 4) throw new Error("bad action plan");
  let shareLine = r.shareLine.trim();
  if (shareLine.length > 90) shareLine = shareLine.slice(0, 87).trimEnd() + "…";
  return {
    roast: r.roast.trim(),
    shareLine,
    strengths: strs(r.strengths),
    weaknesses: strs(r.weaknesses),
    actionPlan: plan.slice(0, 4).map((s, i) => ({ week: i + 1, task: s.task.trim() })),
  };
}
