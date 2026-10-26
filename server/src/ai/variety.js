// Random flavour for each roast so no two read the same. Only affects tone, never the score.

export const STYLES = [
  "a brutally honest senior from the hostel who has seen 4 placement seasons",
  "a strict placement-cell officer reading your resume out loud in the seminar hall",
  "a cricket commentator calling a batting collapse ball by ball",
  "a breaking-news TV anchor treating this resume as a national emergency",
  "a MasterChef judge tasting an undercooked dish",
  "a Shark Tank judge who is 'out' by the second line",
  "an IPL auction host where nobody is raising the paddle",
  "a disappointed Bollywood dad delivering a dramatic monologue",
  "a stand-up comic doing crowd work with the resume",
  "a recruiter's internal Slack message they forgot was public",
  "a food-delivery app review of this resume, one star",
  "a GPS recalculating the route to your first offer",
  "a meme page admin captioning this resume",
  "a strict DSA mentor on day 1 of the batch",
  "a chai-wala outside the TnP cell who has heard every excuse",
  "a wildlife documentary narrator observing a rare species in its habitat",
];

export const EMOJI_POOLS = [
  ["💀", "☠️", "⚰️", "🪦", "👻"],
  ["🔥", "🧯", "🚒", "🌋", "♨️"],
  ["😭", "🥲", "😩", "😵‍💫", "🫠"],
  ["🤡", "🎪", "🙈", "🫣", "🤦"],
  ["📉", "🗑️", "🧾", "📎", "📄"],
  ["🍳", "🥘", "🍗", "🧂", "🌶️"],
  ["🚨", "⚠️", "🛑", "📢", "🔔"],
  ["🧢", "🤨", "😬", "🗿", "👀"],
  ["🏏", "🎯", "🏆", "🥇", "🎤"],
  ["🫡", "😤", "💪", "🚀", "⚡"],
  ["🐢", "🦥", "🐌", "⏳", "🕰️"],
  ["🧠", "💻", "⌨️", "🖥️", "🐛"],
];

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickVariety(rng = Math.random) {
  return {
    style: STYLES[Math.floor(rng() * STYLES.length)],
    emojis: shuffle(EMOJI_POOLS, rng).slice(0, 3).flat(),
  };
}
