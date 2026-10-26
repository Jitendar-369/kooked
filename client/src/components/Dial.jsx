import { useEffect, useState } from "react";
import { LEVEL_COLORS } from "../levels.js";

// Meat-thermometer style dial: five hand-drawn bands, a needle that swings and overshoots.
const BANDS = ["green", "blue", "yellow", "orange", "red"];
const CX = 150;
const CY = 158;
const R = 118;

function arc(a0, a1, r = R) {
  const p = (a) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

export default function Dial({ score }) {
  const [angle, setAngle] = useState(-90);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const target = -90 + (180 * score) / 100;
    if (reduce) {
      setAngle(target);
      setShown(score);
      return;
    }
    const t = setTimeout(() => setAngle(target), 350);
    let raf;
    const start = performance.now() + 350;
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - start) / 1500));
      setShown(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [score]);

  return (
    <div className="relative mx-auto w-full max-w-[320px]" role="img" aria-label={`Cooked score ${score} out of 100`}>
      <svg viewBox="0 0 300 190" className="w-full overflow-visible">
        <g filter="url(#rough)">
          {BANDS.map((c, i) => {
            const a0 = Math.PI + (i * Math.PI) / 5 + 0.03;
            const a1 = Math.PI + ((i + 1) * Math.PI) / 5 - 0.03;
            return <path key={c} d={arc(a0, a1)} fill="none" stroke={LEVEL_COLORS[c].hex} strokeWidth="22" strokeLinecap="butt" />;
          })}
          <path d={arc(Math.PI, 2 * Math.PI, R + 15)} fill="none" stroke="#2a2420" strokeWidth="2.5" />
          {Array.from({ length: 21 }, (_, i) => {
            const a = Math.PI + (i * Math.PI) / 20;
            const r0 = i % 5 === 0 ? R - 22 : R - 16;
            return (
              <line
                key={i}
                x1={CX + r0 * Math.cos(a)}
                y1={CY + r0 * Math.sin(a)}
                x2={CX + (R - 12) * Math.cos(a)}
                y2={CY + (R - 12) * Math.sin(a)}
                stroke="#2a2420"
                strokeWidth={i % 5 === 0 ? 3 : 1.5}
                strokeLinecap="round"
              />
            );
          })}
        </g>
        {BANDS.map((c, i) => {
          const a = Math.PI + ((i + 0.5) * Math.PI) / 5;
          const r = R + 30;
          return (
            <text key={c} x={CX + r * Math.cos(a)} y={CY + r * Math.sin(a) + 4} textAnchor="middle" fontFamily="Courier Prime, monospace" fontWeight="700" fontSize="11" fill="#2a2420">
              {LEVEL_COLORS[c].band}
            </text>
          );
        })}
        <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 1.6s cubic-bezier(.34,1.56,.64,1)" }}>
          <path d={`M${CX - 6} ${CY} L ${CX} ${CY - R + 8} L ${CX + 6} ${CY} Z`} fill="#2a2420" />
        </g>
        <circle cx={CX} cy={CY} r="12" fill="#d93a26" stroke="#2a2420" strokeWidth="3" />
      </svg>
      <div className="-mt-1 text-center">
        <span className="font-marker text-6xl leading-none tabular-nums">{shown}</span>
        <span className="ml-1 font-mono text-lg font-bold">% KOOKED</span>
      </div>
    </div>
  );
}
