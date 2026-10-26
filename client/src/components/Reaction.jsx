// Sticker slapped on the receipt. Tap it for another reaction.
export default function Reaction({ reaction, onReroll, rerolls, className = "", delay = 1900 }) {
  const [emoji, caption] = reaction;
  const d = rerolls ? 0 : delay;
  return (
    <button type="button" onClick={onReroll} title="tap for another reaction" className={`flex flex-col items-center ${className}`}>
      <span key={`e${rerolls}`} className="pop grid h-24 w-24 place-items-center rounded-full border-[3px] border-ink bg-haldi text-[54px] shadow-[4px_5px_0_#2a2420]" style={{ animationDelay: `${d}ms` }}>
        <span className="wiggle inline-block">{emoji}</span>
      </span>
      <span key={`c${rerolls}`} className="pop mt-2 max-w-[13rem] rotate-[-2deg] rounded-sm bg-ink px-2 py-1 text-center font-hand text-[15px] leading-tight text-paper" style={{ animationDelay: `${d + 150}ms` }}>
        {caption}
      </span>
      <span className="mt-1 font-hand text-[12px] text-ink-soft">(tap for another)</span>
    </button>
  );
}
