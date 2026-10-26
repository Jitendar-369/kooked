import { useMemo, useState } from "react";
import Sticker from "./Sticker.jsx";
import Reveal from "./Reveal.jsx";
import EmojiRain from "./EmojiRain.jsx";
import ShareSection from "./ShareSection.jsx";
import { RAIN, pickReaction } from "../reactions.js";

// Shown when the upload isn't a resume: no score, just a roast of whatever they sent.
export default function NotResume({ result, onReset }) {
  const { documentType, roast, cached } = result;
  const [reaction] = useState(() => pickReaction("notResume"));
  const order = useMemo(() => String(Math.floor(Math.random() * 9000) + 1000), []);
  const lines = roast.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  return (
    <div className="pt-4">
      <EmojiRain emojis={RAIN.notResume} mode="fall" count={26} />
      <p className="chalk-text mb-6 text-center font-chalk text-3xl">wrong order?? 🤨</p>

      <div className="relative mx-auto max-w-md">
        <div className="print paper torn-top torn-bottom rotate-[-0.6deg] font-mono">
          <div className="px-5 pb-2 pt-5 text-center">
            <p className="font-marker text-xl leading-none">KOOKED DHABA</p>
            <p className="mt-1 text-[12px] uppercase tracking-wider text-ink-soft">complaint ticket · do not ignore</p>
            <div className="mt-3 flex justify-between text-[13px]">
              <span>ORDER #{order}</span>
              <span>{cached ? "REPEAT OFFENDER ♻️" : "FRESH 🔥"}</span>
            </div>
          </div>
          <div className="dashed-rule mx-5" />

          <div className="space-y-1 px-5 py-4 text-[15px]">
            <div className="flex items-end gap-2">
              <span>ITEM ORDERED</span>
              <span className="dotted-leader" />
              <span className="font-bold">1 × resume</span>
            </div>
            <div className="flex items-end gap-2">
              <span>ITEM RECEIVED</span>
              <span className="dotted-leader" />
              <span className="font-bold text-tomato">1 × {documentType}</span>
            </div>
          </div>

          <div className="px-4 pb-2 text-center">
            <span className="stamp stamp-slam text-[2.2rem] leading-tight text-tomato" style={{ "--rot": "-9deg", "--delay": "0.9s" }}>
              NOT A RESUME
            </span>
            <Sticker emoji={reaction[0]} caption={reaction[1]} delay={1300} className="mx-auto mt-6 rotate-[-3deg]" />
          </div>
          <div className="dashed-rule mx-5 mt-4" />

          <div className="px-5 py-4">
            <p className="mb-2 text-[13px] font-bold uppercase tracking-[0.18em] text-ink-soft">chef's note (now we roast YOU)</p>
            <div className="space-y-2 font-hand text-[18px] leading-snug">
              {lines.map((line, i) => (
                <p key={i} className="pop" style={{ animationDelay: `${1.7 + i * 0.45}s`, transformOrigin: "left center" }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="dashed-rule mx-5" />

          <div className="space-y-1.5 px-5 py-4 text-[14px]">
            <div className="flex items-end gap-2">
              <span>Roasting your {documentType}</span>
              <span className="dotted-leader" />
              <span className="font-bold">FREE</span>
            </div>
            <div className="flex items-end gap-2">
              <span>Emotional damage</span>
              <span className="dotted-leader" />
              <span className="font-bold">incl.</span>
            </div>
            <div className="mt-2 flex items-end gap-2 border-t-[3px] border-double border-ink pt-2 text-[16px] font-bold">
              <span>TOTAL</span>
              <span className="dotted-leader" />
              <span className="text-tomato">???% KOOKED</span>
            </div>
          </div>

          <div className="px-5 pb-6 pt-2 text-center">
            <div className="barcode mx-auto w-48" />
            <p className="mt-2 text-[13px] font-bold tracking-widest">NO REFUNDS · UPLOAD A REAL RESUME 🙏</p>
          </div>
        </div>
      </div>

      <ShareSection result={result} reaction={reaction} />

      <Reveal tilt={-0.8} className="mx-auto mt-10 max-w-md">
        <button type="button" onClick={onReset} className="btn-hand wobbly-2 wiggle-hover w-full bg-haldi px-6 py-4 font-marker text-2xl text-ink">
          Upload an actual resume 🙄
        </button>
      </Reveal>
    </div>
  );
}
