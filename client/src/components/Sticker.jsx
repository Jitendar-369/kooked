import { useState } from "react";
import { stickerUrl } from "../reactions.js";

// One reaction sticker. Shows the plain emoji instantly, then swaps in the animated version once it loads.
export default function Sticker({ emoji, caption, delay = 1900, className = "" }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <span className="pop relative grid h-28 w-28 place-items-center rounded-full border-[3px] border-ink bg-haldi shadow-[4px_5px_0_#2a2420]" style={{ animationDelay: `${delay}ms` }}>
        <span className={`text-[60px] transition-opacity duration-300 ${loaded ? "opacity-0" : "wiggle"}`}>{emoji}</span>
        {!reduce && !failed && (
          <img
            src={stickerUrl(emoji)}
            alt=""
            width="96"
            height="96"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`absolute h-[88px] w-[88px] transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </span>
      <span className="pop mt-2 max-w-[14rem] rotate-[-2deg] rounded-sm bg-ink px-2 py-1 text-center font-hand text-[15px] leading-tight text-paper" style={{ animationDelay: `${delay + 150}ms` }}>
        {caption}
      </span>
    </div>
  );
}
