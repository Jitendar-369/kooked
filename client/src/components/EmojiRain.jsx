import { useEffect, useMemo, useState } from "react";

// One-shot emoji shower. mode "fall" rains from the top, "burst" explodes from the centre.
export default function EmojiRain({ emojis, mode = "fall", count = 26, duration = 4200 }) {
  const [show, setShow] = useState(true);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = 140 + Math.random() * 220;
        return {
          e: emojis[Math.floor(Math.random() * emojis.length)],
          left: `${Math.random() * 100}%`,
          size: 22 + Math.random() * 26,
          delay: `${Math.random() * (mode === "fall" ? 1400 : 200)}ms`,
          dur: `${(mode === "fall" ? 2200 : 1100) + Math.random() * 1400}ms`,
          drift: `${(Math.random() - 0.5) * 160}px`,
          spin: `${(Math.random() - 0.5) * 720}deg`,
          dx: `${Math.cos(angle) * dist}px`,
          dy: `${Math.sin(angle) * dist - 60}px`,
        };
      }),
    [emojis, count, mode]
  );

  useEffect(() => {
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  if (!show) return null;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {items.map((it, i) =>
        mode === "fall" ? (
          <span key={i} className="absolute top-0" style={{ left: it.left, fontSize: it.size, animation: `fall ${it.dur} cubic-bezier(.35,.1,.65,1) ${it.delay} both`, "--drift": it.drift, "--spin": it.spin }}>
            {it.e}
          </span>
        ) : (
          <span key={i} className="absolute left-1/2 top-[38%]" style={{ fontSize: it.size, animation: `burst ${it.dur} cubic-bezier(.15,.8,.3,1) ${it.delay} both`, "--dx": it.dx, "--dy": it.dy, "--spin": it.spin }}>
            {it.e}
          </span>
        )
      )}
    </div>
  );
}
