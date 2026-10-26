import { useRef, useState } from "react";
import ErrorBanner from "./ErrorBanner.jsx";
import Reveal from "./Reveal.jsx";
import { Arrow, Circle, Underline } from "./Doodles.jsx";
import Logo from "./Logo.jsx";

const PLACEHOLDER = `B.Tech CSE, 2026 batch. CGPA: 7.2

Skills: C++, Python, React, Node.js, MongoDB

Projects:
- Weather App: fetches weather using an API
- Campus Lost & Found: MERN app with auth, 200 users

Internships: none yet
Achievements: 150 LeetCode problems`;

const MAX_BYTES = 2 * 1024 * 1024;

const MENU = [
  ["Cooked Score (0–100)", "FREE"],
  ["One brutal roast (with your name on it)", "FREE"],
  ["Animated reaction sticker", "FREE"],
  ["Itemised bill: why that score", "FREE"],
  ["4-week un-cook recipe", "FREE"],
  ["Ego damage", "incl."],
];

export default function Hero({ onCook, error, totalRoasts }) {
  const [tab, setTab] = useState("pdf");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [nudge, setNudge] = useState(0);
  const inputRef = useRef(null);

  function pick(f) {
    setLocalError("");
    if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) return setLocalError("PDFs only, chief. Or switch to “paste text” 📄");
    if (f.size > MAX_BYTES) return setLocalError("That PDF is thicc. Keep it under 2 MB 🙏");
    setFile(f);
  }

  const ready = tab === "pdf" ? Boolean(file) : text.trim().length >= 40;

  function submit(e) {
    e.preventDefault();
    if (!ready) {
      setNudge((n) => n + 1);
      setLocalError(tab === "pdf" ? "Drop a PDF first, bro. The tawa is waiting 🍳" : "Give me at least a few lines to cook (40+ characters) ✍️");
      return;
    }
    onCook(tab === "pdf" ? { file } : { text });
  }

  return (
    <section>
      <header className="relative pt-6 text-center sm:pt-10">
        <Reveal tilt={-2} className="inline-block">
          <p className="chalk-text font-chalk text-2xl sm:text-3xl">~ today's special ~</p>
        </Reveal>
        <h1 className="relative mt-2 flex flex-col items-center">
          <span className="flex items-center gap-3">
            <Logo className="pop h-20 w-20 -rotate-6 sm:h-24 sm:w-24" />
            <span className="relative -rotate-2 font-marker text-[4.4rem] leading-none text-haldi drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] sm:text-8xl">KOOKED</span>
          </span>
          <span className="chalk-text mt-2 font-chalk text-[2rem] font-bold leading-none sm:text-4xl">placement cooked meter</span>
          <Underline className="mx-auto mt-1 h-5 w-60 sm:w-80" />
        </h1>
        <p className="chalk-text mx-auto mt-3 max-w-sm font-hand text-lg leading-snug sm:text-xl">
          Find out how cooked you are <span className="whitespace-nowrap text-haldi">before placements cook you.</span>
        </p>
      </header>

      <div className="relative mx-auto mt-9 max-w-md">
        <Arrow className="absolute -left-3 -top-14 hidden h-16 w-24 sm:-left-24 sm:-top-6 sm:block" />
        <p className="chalk-text absolute -top-9 right-2 rotate-[4deg] font-chalk text-xl sm:-right-20 sm:top-2">drop it here ↓</p>

        <form onSubmit={submit} className="paper wobbly-2 relative rotate-[-1deg] px-4 pb-5 pt-7 sm:px-6">
          <span className="tape -top-3 left-6 rotate-[-6deg]" />
          <span className="tape -top-3 right-6 rotate-[5deg]" />

          <div className="flex items-baseline justify-between font-mono text-[13px] uppercase tracking-wider text-ink-soft">
            <span>Order ticket</span>
            <span>No. {String(1000 + (totalRoasts % 9000)).padStart(4, "0")}</span>
          </div>
          <div className="dashed-rule my-3" />

          <div role="tablist" className="flex gap-5 font-hand text-[17px]">
            {[
              ["pdf", "upload PDF"],
              ["text", "paste text"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id);
                  setLocalError("");
                }}
                className="group flex items-center gap-2"
              >
                <span className="relative grid h-6 w-6 place-items-center rounded-[4px_7px_5px_6px] border-2 border-ink">
                  {tab === id && (
                    <svg viewBox="0 0 24 24" className="absolute -left-0.5 -top-2 h-8 w-8" aria-hidden="true">
                      <path d="M3 13 L 9 19 L 22 3" fill="none" stroke="#d93a26" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="draw" style={{ "--len": 40, "--dur": "0.3s" }} />
                    </svg>
                  )}
                </span>
                <span className={tab === id ? "font-bold" : "text-ink-soft group-hover:text-ink"}>{label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            {tab === "pdf" ? (
              <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pick(e.dataTransfer.files?.[0]);
                }}
                className={`wobbly flex min-h-44 cursor-pointer flex-col items-center justify-center border-[3px] border-dashed px-4 py-7 text-center transition ${
                  dragging ? "scale-[1.02] border-tomato bg-tomato/10" : file ? "border-pudina bg-pudina/10" : "border-ink/40 hover:border-ink/70"
                }`}
              >
                <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
                {file ? (
                  <>
                    <span key={file.name} className="pop text-5xl">🍳</span>
                    <p className="mt-2 max-w-full truncate font-mono text-[15px] font-bold">{file.name}</p>
                    <p className="font-hand text-sm text-ink-soft">{(file.size / 1024).toFixed(0)} KB · on the tawa · tap to swap</p>
                  </>
                ) : (
                  <>
                    <span className={`text-5xl ${dragging ? "wiggle" : "bob"}`}>📄</span>
                    <p className="mt-2 font-hand text-xl font-bold">Drop your resume PDF here</p>
                    <p className="font-hand text-sm text-ink-soft">or tap to pick one · max 2 MB</p>
                  </>
                )}
              </div>
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                rows={10}
                maxLength={20000}
                className="ruled block min-h-44 w-full resize-y rounded-md border-2 border-ink/30 bg-transparent px-3 py-1 font-hand text-[16px] leading-7 text-ink placeholder:text-ink/35 focus:border-ink/70 focus:outline-none"
              />
            )}
          </div>

          <button
            key={nudge}
            type="submit"
            className={`btn-hand wobbly mt-5 w-full bg-tomato px-6 py-4 font-marker text-2xl tracking-wide text-paper ${nudge ? "shake" : ""}`}
          >
            Cook Me 🔥
          </button>
          <p className="mt-3 text-center font-hand text-[15px] text-ink-soft">🔒 We strip your contact info and don't store your resume.</p>
          <ErrorBanner message={localError || error} />
        </form>
      </div>

      {totalRoasts > 50 && (
        <Reveal tilt={1} className="mt-8 text-center">
          <p className="chalk-text font-chalk text-2xl">
            <span className="relative inline-block px-2">
              <span className="font-marker text-haldi">{totalRoasts.toLocaleString("en-IN")}</span>
              <Circle className="absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)]" color="#f2b230" />
            </span>{" "}
            resumes cooked so far
          </p>
        </Reveal>
      )}

      <Reveal tilt={0.6} delay={150} className="mx-auto mt-12 max-w-md">
        <div className="wobbly border-[3px] border-chalk/60 px-5 py-5">
          <p className="chalk-text text-center font-marker text-2xl">On the menu</p>
          <ul className="mt-3 space-y-2 font-chalk text-[22px] text-chalk">
            {MENU.map(([item, price], i) => (
              <li key={item} className="chalk-text flex items-end gap-2" style={{ transform: `rotate(${(i % 2 ? 0.6 : -0.5)}deg)` }}>
                <span>{item}</span>
                <span className="dotted-leader" />
                <span className="font-bold text-haldi">{price}</span>
              </li>
            ))}
          </ul>
          <p className="chalk-text mt-4 text-center font-chalk text-lg text-chalk-dim">chef's warning: we don't do mild 🌶️🌶️🌶️</p>
        </div>
      </Reveal>
    </section>
  );
}
