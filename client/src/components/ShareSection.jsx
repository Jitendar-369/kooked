import { useEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import ShareCard, { SITE_URL } from "./ShareCard.jsx";
import Reveal from "./Reveal.jsx";

async function renderCard(node) {
  await document.fonts?.ready;
  const opts = { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true, backgroundColor: "#1c2420" };
  // First pass warms up font/image embedding (notably flaky on mobile WebKit); second pass is the keeper.
  await toBlob(node, opts).catch(() => null);
  const blob = await toBlob(node, opts);
  if (!blob) throw new Error("empty image");
  return blob;
}

export default function ShareSection({ result, reaction }) {
  const cardRef = useRef(null);
  const blobRef = useRef(null);
  const [status, setStatus] = useState("preparing"); // preparing | ready | error
  const [msg, setMsg] = useState("");
  const [canShareFiles, setCanShareFiles] = useState(false);

  // Pre-render the PNG once so the Share tap stays within the browser's user-activation window.
  useEffect(() => {
    let alive = true;
    setStatus("preparing");
    const t = setTimeout(async () => {
      try {
        const blob = await renderCard(cardRef.current);
        if (!alive) return;
        blobRef.current = blob;
        const file = new File([blob], "cooked-report.png", { type: "image/png" });
        setCanShareFiles(Boolean(navigator.canShare?.({ files: [file] })));
        setStatus("ready");
      } catch {
        if (alive) setStatus("error");
      }
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [result, reaction]);

  async function getBlob() {
    if (blobRef.current) return blobRef.current;
    blobRef.current = await renderCard(cardRef.current);
    return blobRef.current;
  }

  async function download() {
    setMsg("");
    try {
      const blob = await getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `placement-cooked-${result.score}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setMsg("Saved! Now go post it on your story 📸");
    } catch {
      setMsg("Couldn't bake the image. Screenshot this page instead 🙏");
    }
  }

  async function share() {
    setMsg("");
    try {
      const blob = await getBlob();
      const file = new File([blob], "cooked-report.png", { type: "image/png" });
      await navigator.share({ files: [file], title: "Placement Cooked Meter", text: `${result.shareLine} ${SITE_URL}` });
    } catch (e) {
      if (e?.name !== "AbortError") setMsg("Sharing failed. Download the card and post it manually.");
    }
  }

  return (
    <Reveal tilt={1.5} className="mx-auto mt-14 max-w-md">
      <div className="relative rotate-[1deg] bg-[#ffe066] px-5 pb-6 pt-8 text-ink shadow-[0_18px_26px_-12px_rgba(0,0,0,0.7)]">
        <span className="tape -top-3 left-8 rotate-[-4deg]" />
        <p className="font-marker text-2xl leading-tight">Flex (or confess) on your story 📸</p>
        <p className="mt-1 font-hand text-[17px]">“{result.shareLine}”</p>
        <div className={`mt-5 grid gap-3 ${canShareFiles ? "grid-cols-2" : "grid-cols-1"}`}>
          <button type="button" onClick={download} disabled={status === "preparing"} className="btn-hand wobbly bg-paper px-4 py-3 font-marker text-lg disabled:opacity-60">
            {status === "preparing" ? "plating card…" : "⬇️ Download"}
          </button>
          {canShareFiles && (
            <button type="button" onClick={share} className="btn-hand wobbly-2 bg-tomato px-4 py-3 font-marker text-lg text-paper">
              📤 Share
            </button>
          )}
        </div>
        {(msg || status === "error") && <p className="pop mt-3 text-center font-hand text-[16px]">{msg || "Card preview failed; Download will retry."}</p>}
      </div>

      {/* Off-screen wrapper: the card itself stays unpositioned so html-to-image captures it correctly. */}
      <div aria-hidden="true" style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
        <ShareCard ref={cardRef} score={result.score} level={result.level} shareLine={result.shareLine} reaction={reaction} />
      </div>
    </Reveal>
  );
}
