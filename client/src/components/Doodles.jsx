// Hand-drawn SVG bits. Paths are deliberately wobbly.

export function RoughFilter() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
        <filter id="chalky">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="n" />
          <feComposite in="SourceGraphic" in2="n" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

export function Underline({ color = "#f2b230", className = "", delay = "0.5s" }) {
  return (
    <svg viewBox="0 0 300 24" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M4 15 C 60 6, 120 20, 170 11 S 260 6, 296 13 M 30 20 C 100 14, 200 22, 270 16"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        className="draw"
        style={{ "--len": 700, "--delay": delay, "--dur": "1s" }}
      />
    </svg>
  );
}

export function Arrow({ className = "", delay = "1.2s" }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      <path
        d="M110 8 C 80 6, 40 20, 26 58 M 12 44 L 25 62 L 44 52"
        fill="none"
        stroke="#f1eee4"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="draw"
        style={{ "--len": 220, "--delay": delay, "--dur": "0.9s" }}
      />
    </svg>
  );
}

export function Flame({ className = "", style }) {
  return (
    <svg viewBox="0 0 40 56" className={className} style={style} aria-hidden="true">
      <path className="flame" d="M20 54 C 6 52, 2 40, 8 28 C 11 34, 14 34, 15 30 C 13 20, 18 10, 24 3 C 24 14, 34 20, 35 34 C 36 46, 30 53, 20 54 Z" fill="#f07a26" stroke="#2a2420" strokeWidth="2.5" strokeLinejoin="round" />
      <path className="flame" style={{ animationDelay: "-0.3s" }} d="M20 50 C 13 49, 11 42, 14 36 C 17 40, 19 38, 19 34 C 22 38, 28 41, 27 46 C 26 49, 23 50, 20 50 Z" fill="#f2b230" />
    </svg>
  );
}

export function Scribble({ className = "" }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden="true">
      <path d="M4 22 C 14 6, 22 34, 32 18 S 50 6, 58 22 S 76 34, 86 16 S 106 10, 116 22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="draw" style={{ "--len": 260 }} />
    </svg>
  );
}

export function Circle({ className = "", color = "#d93a26", delay = "0.3s" }) {
  return (
    <svg viewBox="0 0 200 80" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M30 14 C 80 0, 170 4, 190 30 C 205 55, 140 76, 80 74 C 20 72, 2 50, 14 30 C 22 18, 50 10, 70 9"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        className="draw"
        style={{ "--len": 620, "--delay": delay }}
      />
    </svg>
  );
}
