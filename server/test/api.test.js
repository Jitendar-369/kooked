import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createApp } from "../src/app.js";
import { createMockProvider } from "../src/ai/mock.js";
import { createGeminiProvider } from "../src/ai/gemini.js";

const weak = readFileSync(new URL("../samples/weak.txt", import.meta.url), "utf8");
const strong = readFileSync(new URL("../samples/strong.txt", import.meta.url), "utf8");

async function serve(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve({ server, base: `http://127.0.0.1:${server.address().port}/api` }));
  });
}
const post = (base, body) =>
  fetch(`${base}/roast`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

let srv;
before(async () => {
  srv = await serve(createApp({ provider: createMockProvider(), ratePerHour: 100 }));
});
after(() => srv.server.close());

test("health reports mock mode", async () => {
  assert.deepEqual(await (await fetch(`${srv.base}/health`)).json(), { ok: true, mock: true });
});

test("weak sample scores high, strong sample low, second call cached", async () => {
  const w = await (await post(srv.base, { text: weak })).json();
  assert.ok(w.score >= 60, `weak ${w.score}`);
  assert.equal(w.cached, false);
  assert.equal(w.actionPlan.length, 4);
  assert.ok(w.shareLine.length < 90);

  const s = await (await post(srv.base, { text: strong })).json();
  assert.ok(s.score < 30, `strong ${s.score}`);

  const again = await (await post(srv.base, { text: weak })).json();
  assert.equal(again.cached, true);
  assert.equal(again.score, w.score);

  assert.equal((await (await fetch(`${srv.base}/stats`)).json()).totalRoasts, 2);
});

test("PDF upload works and matches text score", async () => {
  const fd = new FormData();
  fd.append("resume", new Blob([readFileSync(new URL("../samples/strong.pdf", import.meta.url))], { type: "application/pdf" }), "strong.pdf");
  const res = await fetch(`${srv.base}/roast`, { method: "POST", body: fd });
  assert.equal(res.status, 200);
  assert.ok((await res.json()).score < 30);
});

test("error cases", async () => {
  let r = await post(srv.base, { text: "too short" });
  assert.equal(r.status, 200);
  const short = await r.json();
  assert.equal(short.notResume, true);
  assert.equal(short.documentType, "a few random words");
  assert.match(short.hint, /Paste your whole resume/);

  r = await post(srv.base, { text: "Once upon a time there was a dragon who liked to eat mangoes all day long by the river." });
  assert.equal(r.status, 200);
  const nr = await r.json();
  assert.equal(nr.notResume, true);
  assert.equal(nr.documentType, "story");
  assert.equal(nr.score, undefined);
  assert.match(nr.roast, /story/);
  assert.ok(nr.shareLine.length < 90);

  const fd = new FormData();
  fd.append("resume", new Blob(["hello"], { type: "text/plain" }), "x.txt");
  r = await fetch(`${srv.base}/roast`, { method: "POST", body: fd });
  assert.equal(r.status, 400);

  const big = new FormData();
  big.append("resume", new Blob([Buffer.alloc(2.5 * 1024 * 1024)], { type: "application/pdf" }), "big.pdf");
  r = await fetch(`${srv.base}/roast`, { method: "POST", body: big });
  assert.equal(r.status, 413);
});

test("rate limit returns a funny 429", async () => {
  const { server, base } = await serve(createApp({ provider: createMockProvider(), ratePerHour: 2 }));
  try {
    for (let i = 0; i < 2; i++) await post(base, { text: "x" });
    const r = await post(base, { text: "x" });
    assert.equal(r.status, 429);
    assert.match((await r.json()).error, /oven/i);
  } finally {
    server.close();
  }
});

// Fake Gemini client that records every payload sent to the "provider".
function fakeGenAI(responses) {
  const calls = [];
  return {
    calls,
    models: {
      async generateContent(req) {
        calls.push(req);
        const next = responses.shift();
        if (next instanceof Error) throw next;
        return { text: typeof next === "string" ? next : JSON.stringify(next) };
      },
    },
  };
}
const extraction = { looksLikeResume: true, cgpa: 8.9, skills: ["React"], projects: [{ name: "CropDoc", isBasic: false }], internships: 1, achievements: [], hasDsa: true };
const roastOut = { roast: "nice", shareLine: "I'm cooked", strengths: ["a"], weaknesses: ["b"], actionPlan: [1, 2, 3, 4].map((week) => ({ week, task: "do" })) };

test("contact details never reach Gemini; structured output config is set", async () => {
  const client = fakeGenAI([extraction, roastOut]);
  const { server, base } = await serve(createApp({ provider: createGeminiProvider({ client, model: "test-model" }) }));
  try {
    const r = await post(base, { text: strong });
    assert.equal(r.status, 200);
  } finally {
    server.close();
  }
  assert.equal(client.calls.length, 2);
  const sent = JSON.stringify(client.calls);
  for (const leak of ["priya.iyer@example.com", "91234", "56789", "github.com/priyaiyer", "linkedin.com", "@"])
    assert.ok(!sent.includes(leak), `leaked ${leak}`);
  const [ex, ro] = client.calls;
  assert.match(ex.contents, /^<resume>[\s\S]*<\/resume>$/);
  assert.equal(ex.config.temperature, 0);
  assert.equal(ex.config.responseMimeType, "application/json");
  assert.ok(ex.config.responseJsonSchema);
  assert.equal(ro.config.temperature, 0.9);
  assert.ok(!ro.contents.includes("CampusConnect - full-stack"), "roast call must not include raw resume");
});

test("AI failure retries once then 502", async () => {
  const client = fakeGenAI(["not json", new Error("boom")]);
  const { server, base } = await serve(createApp({ provider: createGeminiProvider({ client, model: "m" }) }));
  try {
    const r = await post(base, { text: weak });
    assert.equal(r.status, 502);
    assert.equal((await r.json()).error, "The oven exploded. Try again.");
    assert.equal(client.calls.length, 2);
  } finally {
    server.close();
  }
});

test("malformed first response is retried successfully", async () => {
  const client = fakeGenAI(["{oops", extraction, roastOut]);
  const { server, base } = await serve(createApp({ provider: createGeminiProvider({ client, model: "m" }) }));
  try {
    assert.equal((await post(base, { text: weak })).status, 200);
  } finally {
    server.close();
  }
});

test("a PDF with no text gets roasted with an ATS tip, not an error", async () => {
  // Minimal valid PDF with an empty page (what a scanned/image-only PDF looks like to pdf-parse).
  const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>"];
  let pdf = "%PDF-1.4\n";
  const offsets = objs.map((o, i) => {
    const at = pdf.length;
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
    return at;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const fd = new FormData();
  fd.append("resume", new Blob([pdf], { type: "application/pdf" }), "scan.pdf");
  const r = await fetch(`${srv.base}/roast`, { method: "POST", body: fd });
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.equal(body.notResume, true);
  assert.equal(body.documentType, "scanned PDF with no readable text");
  assert.match(body.hint, /ATS/);
});

test("Gemini rate limit is not retried and returns a friendly 503", async () => {
  const quota = Object.assign(new Error("RESOURCE_EXHAUSTED: quota exceeded"), { status: 429 });
  const client = fakeGenAI([quota, quota]);
  const { server, base } = await serve(createApp({ provider: createGeminiProvider({ client, model: "m" }) }));
  try {
    const r = await post(base, { text: weak });
    assert.equal(r.status, 503);
    assert.match((await r.json()).error, /Try again in a minute/);
    assert.equal(client.calls.length, 1);
  } finally {
    server.close();
  }
});
