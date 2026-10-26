import { useEffect, useState } from "react";
import { roastResume, getStats } from "./api.js";
import Hero from "./components/Hero.jsx";
import Loading from "./components/Loading.jsx";
import Results from "./components/Results.jsx";
import NotResume from "./components/NotResume.jsx";
import ChalkDust from "./components/ChalkDust.jsx";
import { RoughFilter } from "./components/Doodles.jsx";

export default function App() {
  const [stage, setStage] = useState("input"); // input | loading | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [totalRoasts, setTotalRoasts] = useState(0);

  useEffect(() => {
    getStats()
      .then((s) => setTotalRoasts(s.totalRoasts ?? 0))
      .catch(() => {});
  }, [result]);

  async function cook(input) {
    setError("");
    setStage("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const data = await roastResume(input);
      setResult(data);
      setStage("results");
    } catch (e) {
      setError(e.message);
      setStage("input");
    }
  }

  function reset() {
    setResult(null);
    setError("");
    setStage("input");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <RoughFilter />
      <ChalkDust />
      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-16 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-6">
        {stage === "input" && <Hero onCook={cook} error={error} totalRoasts={totalRoasts} />}
        {stage === "loading" && <Loading />}
        {stage === "results" && result && (result.notResume ? <NotResume result={result} onReset={reset} /> : <Results result={result} onReset={reset} />)}
      </main>
      <footer className="chalk-text relative z-10 px-4 pb-10 text-center font-chalk text-lg text-chalk-dim">
        made with 🔥 and zero chill, for everyone staring at a placement drive.
        <br />
        not affiliated with any college (they'd never).
        <br />
        <span className="text-sm">animated stickers: Noto Emoji by Google (CC BY 4.0)</span>
      </footer>
    </div>
  );
}
