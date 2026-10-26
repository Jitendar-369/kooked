import { useEffect, useMemo, useState } from "react";

const MESSAGES = [
  "Preheating the tawa… 🍳",
  "Checking if your calculator app is still alive… 🧮",
  "Counting your to-do apps… 📝",
  "Asking the placement cell about you… 🏢",
  "Googling what 'proficient in MS Office' means… 🤨",
  "Taking your CGPA's temperature… 🌡️",
  "Looking for your GitHub. Still looking… 🔦",
  "Adding extra mirchi to the roast… 🌶️",
  "Comparing you with Sharma ji's son… 👀",
  "Asking ChatGPT if 'hardworking' counts as a skill… 🤖",
  "Reading your 'Hobbies: Reading' section… 📚",
  "Measuring the white space… 📏",
  "Converting your percentage. Dividing by 9.5… 🧮",
  "Searching for the word 'scalable'… 🔍",
  "Dusting off your 2nd-year mini project… 🧹",
  "Checking if 'HTML' is your programming language… 💀",
  "Calling your 3 LeetCode easys for a reference… 📞",
  "Flipping your resume so it cooks evenly… 🥞",
  "Bribing the ATS with samosas… 🥟",
  "Writing the itemised bill… 🧾",
  "Sharpening the roast knives… 🔪",
  "Plating your results… 🍽️",
];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function PanScene() {
  return (
    <svg viewBox="0 0 260 220" className="h-56 w-64" aria-hidden="true">
      {/* steam */}
      {[70, 120, 170].map((x, i) => (
        <path
          key={x}
          d={`M${x} 70 C ${x - 10} 55, ${x + 10} 45, ${x} 30 S ${x - 8} 10, ${x + 2} 0`}
          fill="none"
          stroke="rgba(241,238,228,0.7)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="80"
          style={{ animation: `steam 1.8s ease-out ${i * 0.5}s infinite` }}
        />
      ))}
      <g style={{ transformOrigin: "130px 150px", animation: "pan-shake 0.5s ease-in-out infinite" }}>
        {/* resume flipping */}
        <g style={{ transformOrigin: "120px 120px", transformBox: "view-box", animation: "flip-up 1.6s cubic-bezier(.4,0,.3,1) infinite" }}>
          <rect x="95" y="100" width="50" height="36" rx="3" fill="#f7f0dc" stroke="#2a2420" strokeWidth="2.5" />
          <path d="M102 110 h30 M102 117 h36 M102 124 h24" stroke="#2a2420" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* pan */}
        <path d="M40 135 C 45 165, 200 165, 205 135 Z" fill="#3a3a3a" stroke="#f1eee4" strokeWidth="3" strokeLinejoin="round" />
        <path d="M38 134 C 90 128, 160 128, 207 134" fill="none" stroke="#f1eee4" strokeWidth="3" strokeLinecap="round" />
        <path d="M205 138 L 252 128" stroke="#f1eee4" strokeWidth="9" strokeLinecap="round" />
        <path d="M205 138 L 252 128" stroke="#7a4b2a" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* flames */}
      {[80, 110, 140, 170].map((x, i) => (
        <g key={x} transform={`translate(${x - 14} 160)`}>
          <path className="flame" style={{ animationDelay: `${-i * 0.23}s` }} d="M14 50 C 2 48, 0 36, 6 26 C 9 31, 11 30, 12 27 C 11 18, 15 9, 20 3 C 20 13, 28 19, 28 32 C 28 43, 23 49, 14 50 Z" fill="#f07a26" stroke="#2a2420" strokeWidth="2" />
          <path className="flame" style={{ animationDelay: `${-i * 0.31}s` }} d="M14 47 C 9 46, 8 40, 10 35 C 13 38, 15 37, 15 33 C 18 37, 22 40, 21 44 C 20 46, 17 47, 14 47 Z" fill="#f2b230" />
        </g>
      ))}
      <path d="M50 212 C 100 206, 160 216, 212 210" stroke="rgba(241,238,228,0.6)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Loading() {
  const order = useMemo(() => shuffle(MESSAGES), []);
  const [i, setI] = useState(0);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % order.length), 1900);
    const s = setInterval(() => setSecs((n) => n + 1), 1000);
    return () => {
      clearInterval(t);
      clearInterval(s);
    };
  }, [order.length]);

  return (
    <section className="flex min-h-[78dvh] flex-col items-center justify-center text-center" aria-live="polite">
      <PanScene />
      <p key={i} className="pop chalk-text mt-4 min-h-[4.5rem] max-w-xs font-chalk text-[28px] font-bold leading-tight">
        {order[i]}
      </p>
      <p className="chalk-text mt-3 font-chalk text-xl text-chalk-dim">
        {secs < 20 ? "usually 5–15 seconds" : secs < 45 ? "the server was napping, waking it up… 😴" : "almost there, the tawa is stubborn 🙏"}
      </p>
    </section>
  );
}
