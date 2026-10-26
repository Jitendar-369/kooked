import { useEffect, useMemo, useState } from "react";
import Dial from "./Dial.jsx";
import Reaction from "./Reaction.jsx";
import Reveal from "./Reveal.jsx";
import EmojiRain from "./EmojiRain.jsx";
import ShareSection from "./ShareSection.jsx";
import { colorFor } from "../levels.js";
import { RAIN, pickReaction } from "../reactions.js";

const pad = (s, n) => String(s).padStart(n, "0");

function Section({ title, children }) {
  return (
    <div className="px-5 py-4">
      <p className="mb-2 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-ink-soft">{title}</p>
      {children}
    </div>
  );
}

function Check({ done }) {
  return (
    <span className="relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[5px_8px_4px_7px] border-2 border-ink bg-paper">
      {done && (
        <svg viewBox="0 0 24 24" className="absolute -left-1 -top-2 h-8 w-8" aria-hidden="true">
          <path d="M3 13 L 9 19 L 22 3" fill="none" stroke="#3f9f6a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="draw" style={{ "--len": 40, "--dur": "0.35s" }} />
        </svg>
      )}
    </span>
  );
}

export default function Results({ result, onReset }) {
  const { score, level, reasons, roast, strengths, weaknesses, actionPlan, cached } = result;
  const { hex } = colorFor(level);
  const [shaking, setShaking] = useState(false);
  const [done, setDone] = useState([]);
  const [reaction, setReaction] = useState(() => pickReaction(level.color));
  const [rerolls, setRerolls] = useState(0);
  const reroll = () => {
    setReaction((r) => pickReaction(level.color, `${r[0]}${r[1]}`));
    setRerolls((n) => n + 1);
  };
  const order = useMemo(() => pad(Math.floor(Math.random() * 9000) + 1000, 4), []);
  const today = useMemo(() => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }), []);
  // The roast comes as lines; if the model sent one paragraph, break it at sentence ends instead.
  const roastLines = (roast.includes("\n") ? roast.split(/\n+/) : roast.split(/(?<=[.!])\s+(?=[A-Z0-9"“'])/)).map((l) => l.trim()).filter(Boolean);
  const subtotal = 10 + reasons.reduce((s, r) => s + r.points, 0);
  const rainMode = level.color === "green" || level.color === "blue" ? "burst" : "fall";

  useEffect(() => {
    if (score <= 60) return;
    const t = setTimeout(() => setShaking(true), 1950);
    const u = setTimeout(() => setShaking(false), 2600);
    return () => {
      clearTimeout(t);
      clearTimeout(u);
    };
  }, [score]);

  return (
    <div className="pt-4">
      <EmojiRain emojis={RAIN[level.color] ?? RAIN.orange} mode={rainMode} count={score > 80 ? 34 : 24} />

      <p className="chalk-text mb-6 text-center font-chalk text-3xl">order up! 🛎️</p>

      {/* The receipt */}
      <div className={`relative mx-auto max-w-md ${shaking ? "shake" : ""}`}>
        <div className="print paper torn-top torn-bottom rotate-[0.6deg] font-mono">
          <div className="px-5 pb-2 pt-5 text-center">
            <p className="font-marker text-xl leading-none">PLACEMENT COOKED DHABA</p>
            <p className="mt-1 text-[12px] uppercase tracking-wider text-ink-soft">pure veg · pure roast · since this semester</p>
            <div className="mt-3 flex justify-between text-[13px]">
              <span>ORDER #{order}</span>
              <span>{today}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span>TABLE: PLACEMENT '26</span>
              <span>{cached ? "REHEATED ♻️" : "FRESH 🔥"}</span>
            </div>
          </div>
          <div className="dashed-rule mx-5" />

          <div className="relative px-4 pb-2 pt-5">
            <Dial score={score} />
            <div className="mt-3 text-center">
              <span className="stamp stamp-slam text-[2.1rem] leading-tight sm:text-[2.4rem]" style={{ color: hex, "--rot": "-7deg", "--delay": "1.7s" }}>
                {level.label}
              </span>
              <p className="mt-3 font-hand text-[17px] text-ink-soft">“{level.tagline}”</p>
            </div>
            <Reaction reaction={reaction} onReroll={reroll} rerolls={rerolls} className="mx-auto mt-5 rotate-[3deg]" />
          </div>
          <div className="dashed-rule mx-5 mt-3" />

          <Section title="chef's note (the roast)">
            <div className="space-y-2 font-hand text-[18px] leading-snug">
              {roastLines.map((line, i) => (
                <p key={i} className="pop" style={{ animationDelay: `${2.2 + i * 0.45}s`, transformOrigin: "left center" }}>
                  {line}
                </p>
              ))}
            </div>
          </Section>
          <div className="dashed-rule mx-5" />

          <Section title="what's actually good">
            {strengths.length ? (
              <ul className="space-y-1.5 font-hand text-[16px] leading-snug">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-pudina">✔</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-hand text-[16px]">Searched the whole resume. Nothing yet. Build something 👀</p>
            )}
          </Section>

          <Section title="what's burning">
            <ul className="space-y-1.5 font-hand text-[16px] leading-snug">
              {weaknesses.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-bold text-tomato">✗</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Section>
          <div className="dashed-rule mx-5" />

          <Section title="itemised bill · why this score">
            <ul className="space-y-1.5 text-[14px] leading-snug">
              <li className="flex items-end gap-2">
                <span>Base charge (everyone)</span>
                <span className="dotted-leader" />
                <span className="font-bold">10</span>
              </li>
              {reasons.map((r, i) => (
                <li key={i} className="flex items-end gap-2">
                  <span>{r.reason}</span>
                  <span className="dotted-leader" />
                  <span className="font-bold text-tomato">+{r.points}</span>
                </li>
              ))}
              {subtotal !== score && (
                <li className="flex items-end gap-2 text-ink-soft">
                  <span>{subtotal > score ? "Oven limit (max 98)" : "Minimum charge (3)"}</span>
                  <span className="dotted-leader" />
                  <span className="font-bold">{score - subtotal > 0 ? "+" : ""}{score - subtotal}</span>
                </li>
              )}
            </ul>
            <div className="mt-2 border-t-[3px] border-double border-ink pt-2 text-[16px] font-bold">
              <div className="flex items-end gap-2">
                <span>TOTAL</span>
                <span className="dotted-leader" />
                <span style={{ color: hex }}>{score}% COOKED</span>
              </div>
            </div>
            {!reasons.length && <p className="mt-2 font-hand text-[15px]">Nothing added. You're basically raw. 🥶</p>}
          </Section>

          <div className="px-5 pb-6 pt-2 text-center">
            <div className="barcode mx-auto w-48" />
            <p className="mt-2 text-[13px] font-bold tracking-widest">THANK YOU · VISIT AGAIN 🙏</p>
            <p className="text-[11px] text-ink-soft">*no refunds on ego damage</p>
          </div>
        </div>
      </div>

      {/* Recipe card */}
      <Reveal tilt={-1.2} className="mx-auto mt-14 max-w-md">
        <div className="paper ruled relative rounded-sm px-5 pb-6 pt-8">
          <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-2deg]" />
          <p className="font-marker text-2xl leading-tight text-tomato">Chef's recipe 📜</p>
          <p className="font-hand text-[16px] text-ink-soft">un-cook yourself in 4 weeks. tick them off as you go.</p>
          <ol className="mt-4 space-y-4">
            {actionPlan.map((step, i) => {
              const isDone = done.includes(i);
              return (
                <li key={step.week}>
                  <button
                    type="button"
                    onClick={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
                    className="flex w-full gap-3 text-left"
                  >
                    <Check done={isDone} />
                    <span>
                      <span className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-tomato">week {step.week}</span>
                      <span className={`block font-hand text-[17px] leading-snug transition ${isDone ? "text-ink-soft line-through decoration-tomato decoration-2" : ""}`}>{step.task}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          {done.length === actionPlan.length && actionPlan.length > 0 && (
            <p className="pop mt-5 text-center font-marker text-xl text-pudina">all done?! come back and re-cook 🔁🔥</p>
          )}
        </div>
      </Reveal>

      <ShareSection result={result} reaction={reaction} />

      <Reveal tilt={0.8} className="mx-auto mt-10 max-w-md">
        <button type="button" onClick={onReset} className="btn-hand wobbly-2 wiggle-hover w-full bg-haldi px-6 py-4 font-marker text-2xl text-ink">
          Roast another 🔁
        </button>
      </Reveal>
    </div>
  );
}
