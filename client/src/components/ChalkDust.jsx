// Floating chalk dust with the odd ember drifting up from the stove.
const PARTICLES = Array.from({ length: 18 }, (_, i) => {
  const ember = i % 4 === 0;
  return {
    left: `${(i * 41 + 7) % 100}%`,
    duration: `${9 + ((i * 7) % 11)}s`,
    delay: `${-((i * 5) % 13)}s`,
    drift: `${((i % 7) - 3) * 18}px`,
    size: ember ? 3 + (i % 2) : 2 + (i % 3),
    background: ember ? "#f2a33a" : "rgba(241,238,228,0.55)",
    boxShadow: ember ? "0 0 8px 2px rgba(240,122,38,0.7)" : "none",
  };
});

export default function ChalkDust() {
  return (
    <div aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="dust"
          style={{ left: p.left, width: p.size, height: p.size, background: p.background, boxShadow: p.boxShadow, animationDuration: p.duration, animationDelay: p.delay, "--drift": p.drift }}
        />
      ))}
    </div>
  );
}
