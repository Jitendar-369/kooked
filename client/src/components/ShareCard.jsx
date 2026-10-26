import { forwardRef } from "react";
import { colorFor } from "../levels.js";
import Logo from "./Logo.jsx";

export const SITE_URL = (import.meta.env.VITE_SITE_URL || window.location.host).replace(/^https?:\/\//, "").replace(/\/$/, "");

// Fixed 1080×1920 (9:16) story card: chalkboard + taped receipt. Plain CSS only so html-to-image renders it reliably.
const ShareCard = forwardRef(function ShareCard({ result, reaction }, ref) {
  const { notResume, score, level, shareLine, documentType } = result;
  const hex = notResume ? "#cf2a22" : colorFor(level).hex;
  const [emoji, caption] = reaction;
  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1920,
        boxSizing: "border-box",
        padding: "120px 90px 100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        color: "#f1eee4",
        fontFamily: '"Kalam", cursive',
        background:
          "radial-gradient(45% 30% at 18% 18%, rgba(255,255,255,0.06), transparent 70%), radial-gradient(60% 30% at 50% 100%, rgba(240,120,40,0.28), transparent 70%), radial-gradient(130% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.6)), #1c2420",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 26, transform: "rotate(-2deg)" }}>
        <div style={{ width: 170, height: 170 }}><Logo className="h-full w-full" title="Kooked" /></div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontFamily: '"Permanent Marker", cursive', fontSize: 96, lineHeight: 1, color: "#f2b230" }}>KOOKED</div>
          <div style={{ fontFamily: '"Caveat Variable", cursive', fontSize: 50, fontWeight: 700 }}>placement cooked report</div>
        </div>
      </div>

      <div
        style={{
          marginTop: 70,
          width: 860,
          background: "#f7f0dc",
          color: "#2a2420",
          padding: "70px 60px 60px",
          boxSizing: "border-box",
          transform: "rotate(-1.5deg)",
          boxShadow: "0 40px 60px -20px rgba(0,0,0,0.75)",
          position: "relative",
          textAlign: "center",
          borderRadius: "30px 6px 24px 8px / 8px 26px 6px 30px",
        }}
      >
        <div style={{ position: "absolute", top: -26, left: 70, width: 220, height: 56, background: "rgba(233,220,180,0.85)", transform: "rotate(-6deg)" }} />
        <div style={{ position: "absolute", top: -26, right: 70, width: 220, height: 56, background: "rgba(233,220,180,0.85)", transform: "rotate(5deg)" }} />
        <div style={{ fontFamily: '"Courier Prime", monospace', fontSize: 30, letterSpacing: "0.2em", fontWeight: 700, color: "#6b6156" }}>
          {notResume ? `RECEIVED: ${documentType.toUpperCase()}` : "ORDER UP · TOTAL"}
        </div>
        <div style={{ fontFamily: '"Permanent Marker", cursive', fontSize: notResume ? 240 : 300, lineHeight: 1, marginTop: 20, color: hex }}>{notResume ? "???%" : `${score}%`}</div>
        <div style={{ fontFamily: '"Courier Prime", monospace', fontSize: 44, fontWeight: 700, letterSpacing: "0.15em" }}>KOOKED</div>
        <div
          style={{
            display: "inline-block",
            marginTop: 50,
            padding: "10px 36px",
            border: `8px solid ${hex}`,
            outline: `4px solid ${hex}`,
            outlineOffset: 8,
            borderRadius: 12,
            color: hex,
            fontFamily: '"Permanent Marker", cursive',
            fontSize: 86,
            lineHeight: 1.1,
            transform: "rotate(-6deg)",
            textTransform: "uppercase",
          }}
        >
          {notResume ? "NOT A RESUME" : level.label}
        </div>
        <div style={{ marginTop: 50, borderTop: "4px dashed rgba(42,36,32,0.45)" }} />
        <div style={{ marginTop: 44, fontSize: 52, lineHeight: 1.3, fontWeight: 700 }}>“{shareLine}”</div>
      </div>

      <div style={{ marginTop: 70, display: "flex", alignItems: "center", gap: 34, transform: "rotate(2deg)" }}>
        <div style={{ width: 190, height: 190, borderRadius: "50%", background: "#f2b230", border: "8px solid #2a2420", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 110, boxShadow: "10px 12px 0 #000" }}>{emoji}</div>
        <div style={{ maxWidth: 520, background: "#2a2420", color: "#f7f0dc", padding: "14px 26px", fontSize: 44, lineHeight: 1.2, transform: "rotate(-3deg)" }}>{caption}</div>
      </div>

      <div style={{ marginTop: "auto", textAlign: "center" }}>
        <div style={{ fontFamily: '"Caveat Variable", cursive', fontSize: 58, fontWeight: 700 }}>how kooked are you? 👇</div>
        <div style={{ fontFamily: '"Permanent Marker", cursive', fontSize: 64, color: "#f2b230", marginTop: 8 }}>{SITE_URL}</div>
      </div>
    </div>
  );
});

export default ShareCard;
