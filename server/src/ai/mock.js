// Offline stand-in for Gemini: regex extraction + template roast, same interface as gemini.js.
import { normalizeFacts, normalizeRoast, normalizeNotResume } from "./schemas.js";
import { pickVariety } from "./variety.js";

const SKILLS = [
  "C", "C++", "Java", "Python", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin", "Swift", "SQL", "HTML", "CSS",
  "React", "Next.js", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot",
  "MongoDB", "MySQL", "PostgreSQL", "Redis", "Firebase", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git",
  "Linux", "TensorFlow", "PyTorch", "scikit-learn", "Pandas", "NumPy", "Machine Learning", "Deep Learning",
  "NLP", "OpenCV", "Tailwind", "Bootstrap", "Flutter", "React Native", "Android", "GraphQL", "REST",
];
const HEADINGS = /^(education|skills|technical skills|projects|experience|work experience|internships?|achievements|awards|certifications|extracurriculars?|summary|objective|profiles?|links|contact)\b\s*:?/i;
const BASIC = /calculator|to-?\s?do|weather|tic[\s-]?tac[\s-]?toe|clone|static|landing page|portfolio (site|website)|rock[\s-]?paper|stopwatch|digital clock/i;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function section(lines, name) {
  const start = lines.findIndex((l) => new RegExp(`^${name}\\b`, "i").test(l.trim()));
  if (start === -1) return [];
  const first = lines[start].trim().replace(new RegExp(`^${name}\\w*\\s*:?\\s*`, "i"), "");
  const out = first ? [first] : [];
  for (let i = start + 1; i < lines.length && !HEADINGS.test(lines[i].trim()); i++) out.push(lines[i]);
  return out.map((l) => l.replace(/^[\s•\-*–·]+/, "").trim()).filter(Boolean);
}

const NOT_NAMES = /^(resume|curriculum|vitae|cv|profile|summary|education|contact|name|email|phone)$/i;

function guessFirstName(lines) {
  const first = lines.map((l) => l.trim()).find(Boolean) ?? "";
  const m = first.match(/^(?:name\s*[:\-]\s*)?([A-Za-z][a-z]+|[A-Z]{2,})(?:\s+[A-Za-z.]+){0,3}$/);
  return m && !NOT_NAMES.test(m[1]) ? m[1] : null;
}

function boardPercent(text, label) {
  const line = text.split("\n").find((l) => label.test(l));
  if (!line) return null;
  const pct = line.match(/(\d{2}(?:\.\d+)?)\s*%/);
  if (pct) return parseFloat(pct[1]);
  const cg = line.match(/(\d(?:\.\d{1,2})?)\s*(?:\/\s*10|cgpa)/i);
  return cg ? Math.round(parseFloat(cg[1]) * 9.5 * 10) / 10 : null;
}

const DOC_TYPES = [
  [/electricity|kwh|units consumed/i, "electricity bill"],
  [/water (bill|charges)|water supply/i, "water bill"],
  [/invoice|amount due|bill no|gst/i, "bill"],
  [/ingredients|tablespoon|teaspoon|preheat/i, "recipe"],
  [/pnr|boarding|berth|departure/i, "train ticket"],
  [/chapter|lecture|unit \d|syllabus/i, "lecture notes"],
  [/dear |regards|sincerely/i, "letter"],
  [/once upon a time|dragon|kingdom/i, "story"],
  [/menu|paneer|biryani|thali/i, "food menu"],
];

function guessDocType(text) {
  return DOC_TYPES.find(([re]) => re.test(text))?.[1] ?? "random text";
}

export function mockExtract(text) {
  const lines = text.split("\n");
  const sectionWords = (text.match(/\b(education|skills|projects?|experience|internships?|cgpa|b\.?\s?tech|b\.?e\.?|university|college|achievements|certifications?)\b/gi) ?? []).map((w) => w.toLowerCase());
  const looksLikeResume = new Set(sectionWords).size >= 2;

  let cgpa = null;
  const g = text.match(/\b(?:c?gpa|sgpa)\b\s*[:\-–]?\s*(\d{1,2}(?:\.\d{1,2})?)/i) ?? text.match(/(\d\.\d{1,2})\s*(?:\/\s*10|cgpa)/i);
  if (g) cgpa = parseFloat(g[1]);
  else {
    const p = text.match(/(\d{2}(?:\.\d+)?)\s*%/);
    if (p) cgpa = parseFloat(p[1]) / 9.5;
  }

  const skills = SKILLS.filter((s) => new RegExp(`(^|[^\\w+#.])${esc(s)}(?![\\w+#])`, "i").test(text));

  let projectLines = section(lines, "projects?");
  if (projectLines.length === 1) projectLines = projectLines[0].split(/,|;/);
  const projects = projectLines
    .map((l) => l.split(/\s[|:–—-]\s|:\s/)[0].trim())
    .filter((n) => n && n.length <= 80 && !/^(built|made|developed|used|tech)/i.test(n))
    .map((name) => ({ name, isBasic: BASIC.test(name) }));

  let internships = 0;
  const declared = text.match(/internships?\s*[:\-]\s*(\d+|none|nil|no)\b/i);
  if (declared) internships = parseInt(declared[1], 10) || 0;
  else if (!/\b(no|zero|none)\s+internships?\b/i.test(text))
    internships = lines.filter((l) => /\bintern(ship)?\b/i.test(l) && !HEADINGS.test(l.trim())).length;

  const achievements = lines
    .map((l) => l.replace(/^[\s•\-*–·]+/, "").replace(HEADINGS, "").trim())
    .filter((l) => l && /hackathon|award|winner|\bwon\b|\brank(ed)?\b|certif|scholarship|finalist|olympiad|1st|2nd|3rd/i.test(l))
    .filter((l) => !/^(none|no |nil)/i.test(l));

  const hasDsa = /leetcode|codeforces|codechef|hackerrank|\bdsa\b|data structures|competitive programming/i.test(text);

  return normalizeFacts({
    looksLikeResume,
    documentType: looksLikeResume ? "resume" : guessDocType(text),
    firstName: guessFirstName(lines),
    class10Percent: boardPercent(text, /(?:10th|\bssc\b|class\s*(?:x|10)\b|matric|cbse\s*x\b|(?<!senior )secondary school)/i),
    class12Percent: boardPercent(text, /(?:12th|\bhsc\b|class\s*(?:xii|12)\b|intermediate|diploma|senior secondary)/i),
    cgpa,
    skills,
    projects,
    internships,
    achievements,
    hasDsa,
  });
}

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// {p} = a project name, {s} = a skill, {c} = CGPA, {n} = score. Each band mixes opener + gap jab + closer.
const OPENERS = {
  top: [
    "Okay fine, this resume actually slaps {e}",
    "Respect where it's due, {p} is real work {e}",
    "This resume walked into placement season like it's owed an offer {e}",
    "Recruiters are going to fight over this one, not gonna lie {e}",
    "This resume has main character energy {e}",
  ],
  mid: [
    "Not bad, not great, very \"we'll get back to you\" {e}",
    "{p} is doing all the heavy lifting here and it's tired {e}",
    "Half-cooked. Edible, but nobody's ordering seconds {e}",
    "The resume is giving 'almost there' for the third semester in a row {e}",
    "Solid start, but recruiters don't hire starts {e}",
  ],
  low: [
    "Medium rare and sweating through the plate {e}",
    "This resume reads like a syllabus, not a candidate {e}",
    "The ATS opened this, sighed, and closed it {e}",
    "{s} on the resume, nothing built with it. Classic {e}",
    "Placement officer saw this and quietly added you to the 'needs help' list {e}",
  ],
  burnt: [
    "{p} in {y}? The recruiter's ATS just filed a noise complaint {e}",
    "This isn't a resume, it's a cry for help in Times New Roman {e}",
    "Even the college's own placement brochure wouldn't print this {e}",
    "Bro's resume has more white space than achievements {e}",
    "The oven didn't cook this one, it cremated it {e}",
    "Recruiter skimmed it in 6 seconds and still felt it was too long {e}",
  ],
};

const JABS = {
  "No internships yet": [
    "Zero internships means zero proof anyone's trusted you with real code {e}",
    "Internship section is emptier than the canteen after 2 PM {e}",
    "No internship, so your 'industry experience' is watching tech YouTube at 2x {e}",
  ],
  "Only one internship": [
    "One internship is a sample size, not a track record {e}",
    "Single internship carrying the whole experience section on its back {e}",
  ],
  "No projects listed": [
    "No projects. What exactly were you doing for four years? {e}",
    "Projects section missing like your attendance in 8 AM lectures {e}",
  ],
  "Every project is a tutorial classic (calculator/to-do/clone tier)": [
    "{p}? Every YouTube tutorial's first video called, it wants its project back {e}",
    "Calculator and to-do apps are not projects, they're homework {e}",
    "Your projects have been built 4 million times this year alone {e}",
  ],
  "Only one project that isn't a tutorial classic": [
    "One real project and the rest is filler, recruiters can smell it {e}",
    "{p} is fine, but one good project is a fluke, two is a pattern {e}",
  ],
  "No DSA / competitive programming signal": [
    "No DSA anywhere, so the OA is going to eat you alive {e}",
    "Online assessment round is going to be a horror movie {e}",
  ],
  "No GitHub or portfolio link": [
    "No GitHub link. So we're just supposed to trust you? {e}",
    "Your code exists only in your heart and maybe a pendrive {e}",
  ],
  "No hackathons, awards or certs": [
    "Achievements section is in airplane mode {e}",
    "Not a single hackathon, not even for the free t-shirt {e}",
  ],
  cgpa: [
    "CGPA {c} is getting filtered out before a human even sees it {e}",
    "{c} CGPA means half the shortlist cutoffs already ghosted you {e}",
  ],
  skills: [
    "Skills section is so short it fits in a tweet {e}",
    "Listing {s} alone as your skill set is a bold strategy {e}",
  ],
};

const NAME_HOOKS = ["{f}, we need to talk {e}", "{f} bro... sit down {e}", "Okay {f}, deep breath {e}", "{f}, the recruiter has questions {e}", "Dear {f}, this is an intervention {e}"];

// Always something to roast, even when the big stuff is fine.
function smallJabs(facts) {
  const out = [];
  const cert = facts.achievements.find((a) => /certif|course|udemy|coursera|nptel/i.test(a));
  if (cert) out.push(`"${cert.slice(0, 40)}"? Got this cert for what, a free t-shirt? {e}`);
  if (facts.projects.some((p) => !p.isBasic)) out.push("{p} looks great. Be honest, how much of it did ChatGPT write? {e}");
  if (facts.class10Percent !== null && facts.class10Percent < 85) out.push(`${facts.class10Percent}% in 10th? Bro peaked in 9th {e}`);
  if (facts.class10Percent !== null && facts.class12Percent !== null && facts.class12Percent < facts.class10Percent - 8)
    out.push(`${facts.class10Percent}% in 10th, ${facts.class12Percent}% in 12th. The downfall arc is real {e}`);
  if (facts.skills.length > 12) out.push("{k} skills listed. Name three you can actually defend in an interview {e}");
  out.push("Skills section looks copy-pasted from a job description {e}");
  return out;
}

const NOT_RESUME = [
  "You had ONE job: upload a resume. You uploaded a {d} {e}",
  "{f}, is this your {d}? Recruiters asked for a resume, not your personal documents {e}",
  "Bro really said 'here's my {d}' to a resume roaster {e}",
  "If this is how you follow instructions, the online assessment is going to be a bloodbath {e}",
  "HR opened this {d} and started questioning their career {e}",
  "Can't find your own resume? That's already your first red flag {e}",
  "Imagine walking into the interview and handing them a {d} {e}",
  "Even the ATS is confused, and the ATS has seen things {e}",
];
const NOT_RESUME_SHARE = [
  "I uploaded a {d} to a resume roaster {e}",
  "Tried to get my resume roasted, uploaded a {d} instead {e}",
  "Placement prep status: uploaded my {d} {e}",
];

export function mockRoastNotResume({ documentType, firstName }, rng = Math.random) {
  const pool = [...pickVariety(rng).emojis];
  const e = () => (pool.length ? pool.splice(Math.floor(rng() * pool.length), 1)[0] : "💀");
  const fill = (t) =>
    t.replace(/\{(\w)\}/g, (_, k) => (k === "e" ? e() : k === "d" ? documentType : firstName ?? "Bro")).replace(/\ba ([aeiou])/gi, "an $1");
  const lines = [...NOT_RESUME].sort(() => rng() - 0.5).slice(0, 3).map(fill);
  lines.push(fill("Go find the actual resume and come back {e}"));
  let shareLine = fill(pick(NOT_RESUME_SHARE, rng));
  if (shareLine.length > 89) shareLine = "I uploaded the wrong file to a resume roaster 💀";
  return normalizeNotResume({ roast: lines.join("\n"), shareLine });
}

const CLOSERS = {
  top: ["Just don't get lazy now {e}", "Keep this energy till the offer letter {e}", "Go collect your offers {e}"],
  mid: ["Fix the gap and you're dangerous {e}", "Four focused weeks and this flips {e}", "Close, but close doesn't pay CTC {e}"],
  low: ["The plan below isn't optional {e}", "Start today, not after the fest {e}", "Placement season won't wait for you {e}"],
  burnt: ["Good news: it's fixable. Bad news: only if you start tonight {e}", "Read the plan. Then actually do the plan {e}", "Rebuild from scratch, starting now {e}"],
};

const SHARE = {
  top: ["Only {n}% cooked. Placements, I'm ready {e}", "{n}% cooked and still the danger {e}", "Barely warm at {n}%, recruiters take notes {e}"],
  mid: ["{n}% cooked. Not burnt yet, but I can smell it {e}", "Got {n}% cooked. Lowkey need to lock in {e}", "{n}% cooked. The grind starts now {e}"],
  low: ["{n}% cooked for placements. Send help {e}", "Got roasted to {n}%. My resume needs therapy {e}", "{n}% cooked. Placement officer is watching me {e}"],
  burnt: ["{n}% cooked. My resume got cremated {e}", "I'm {n}% cooked. Pray for me {e}", "{n}% cooked for placements, I'm literally charcoal {e}"],
};

function band(score) {
  return score <= 20 ? "top" : score <= 40 ? "mid" : score <= 60 ? "low" : "burnt";
}

export function mockRoast({ facts, score, level, reasons }, rng = Math.random) {
  const { emojis } = pickVariety(rng);
  const pool = [...emojis];
  const e = () => (pool.length ? pool.splice(Math.floor(rng() * pool.length), 1)[0] : "🔥");
  const top = [...reasons].sort((a, b) => b.points - a.points);
  const b = band(score);
  const vars = {
    p: facts.projects[0]?.name ?? "your project",
    s: facts.skills[0] ?? "one skill",
    c: facts.cgpa ?? "?",
    n: score,
    y: new Date().getFullYear(),
    f: facts.firstName ?? "bro",
    k: facts.skills.length,
  };
  const fill = (t) => t.replace(/\{(\w)\}/g, (_, k) => (k === "e" ? e() : String(vars[k])));

  const jabFor = (r) => {
    if (!r) return pick(smallJabs(facts), rng);
    if (JABS[r.reason]) return pick(JABS[r.reason], rng);
    if (r.reason.startsWith("CGPA") || r.reason === "No CGPA mentioned") return pick(JABS.cgpa, rng);
    return pick(JABS.skills, rng);
  };
  // 10th/12th marks are prime roast material, so they win the second slot when present.
  const marksJab = smallJabs(facts).find((j) => /in 10th/.test(j));
  const lines = [pick(OPENERS[b], rng), jabFor(top[0])];
  if (marksJab) lines.push(marksJab);
  else if (top[1] && b !== "top") lines.push(jabFor(top[1]));
  else lines.push(pick(smallJabs(facts), rng));
  if (facts.firstName) lines.unshift(pick(NAME_HOOKS, rng));
  else lines.push(pick(CLOSERS[b], rng));
  const roast = lines.map(fill).join("\n");

  const strengths = [];
  if (facts.cgpa !== null && facts.cgpa >= 8) strengths.push(`Strong CGPA of ${facts.cgpa}`);
  if (facts.internships > 0) strengths.push(`${facts.internships} internship${facts.internships > 1 ? "s" : ""} of real-world experience`);
  const solid = facts.projects.filter((p) => !p.isBasic);
  if (solid.length) strengths.push(`Real projects like ${solid.slice(0, 2).map((p) => p.name).join(" and ")}`);
  if (facts.hasDsa) strengths.push("Shows DSA / competitive programming practice");
  if (facts.achievements.length) strengths.push(facts.achievements[0]);
  if (!strengths.length && facts.skills.length) strengths.push(`Knows ${facts.skills.slice(0, 3).join(", ")}`);

  const WEAK_EMOJI = ["🚩", "😬", "💀", "🫠", "📉"];
  const weaknesses = top.slice(0, 3).map((r) => `${r.reason} ${pick(WEAK_EMOJI, rng)}`);

  const tasks = {
    "No internships yet": "Apply to 30 internships/off-campus roles on LinkedIn, Internshala and Wellfound; DM 5 alumni for referrals.",
    "Only one internship": "Turn your internship into 3 impact bullets with numbers, and line up one more freelance or open-source gig.",
    "No projects listed": "Build and deploy one full-stack project (auth + DB + real users) and put the live link on your resume.",
    "Every project is a tutorial classic (calculator/to-do/clone tier)": "Retire the calculator. Build one project that solves a real campus problem, deploy it, and write a solid README.",
    "Only one project that isn't a tutorial classic": "Ship a second serious project in a different area (backend, ML, or mobile) and deploy it.",
    "No DSA / competitive programming signal": "Solve 40 LeetCode easy/medium problems on arrays, strings and hashing; add your profile link.",
    "No GitHub or portfolio link": "Push every project to GitHub with READMEs and screenshots, and add the link to your resume header.",
    "No hackathons, awards or certs": "Register for the next hackathon on Devfolio/Unstop, or finish one credible cert (AWS/Google) this week.",
  };
  const plan = [];
  for (const r of top) {
    const t = tasks[r.reason] ?? (r.reason.startsWith("CGPA") || r.reason === "No CGPA mentioned" ? "Protect your CGPA this semester and add it clearly to your resume; target zero backlogs." : r.reason.startsWith("Only") ? "Add 4–6 relevant skills you can actually defend in an interview, grouped by category." : null);
    if (t && !plan.includes(t)) plan.push(t);
  }
  const fillers = [
    "Do 3 mock interviews (peers or Pramp) and fix the answers you fumbled.",
    "Rewrite every resume bullet as action + tech + measurable impact; keep it to one page.",
    "Solve 5 LeetCode mediums a week and revise OOP, DBMS, OS and CN basics.",
    "Contribute one PR to an open-source repo you actually use.",
  ];
  for (const f of fillers) if (plan.length < 4) plan.push(f);

  let shareLine = fill(pick(SHARE[b], rng));
  if (shareLine.length > 89) shareLine = `${score}% cooked for placements 🔥`;
  return normalizeRoast({
    roast: roast.replace(/[ \t]+/g, " ").trim(),
    shareLine,
    strengths: strengths.slice(0, 3),
    weaknesses,
    actionPlan: plan.slice(0, 4).map((task, i) => ({ week: i + 1, task })),
  });
}

export function createMockProvider() {
  return {
    name: "mock",
    extract: async (cleanText) => mockExtract(cleanText),
    roast: async (input) => mockRoast(input),
    roastNotResume: async (input) => mockRoastNotResume(input),
  };
}
