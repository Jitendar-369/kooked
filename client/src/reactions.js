// One animated sticker per result. Every emoji here has an animated Noto version (checked);
// add new ones only after confirming https://fonts.gstatic.com/s/e/notoemoji/latest/<codepoints>/512.webp exists.
export const REACTIONS = {
  green: [
    ["🐐", "the GOAT has entered the TnP cell"],
    ["😎", "recruiters, form a queue"],
    ["🫡", "salute. barely any notes."],
    ["👑", "placement season? more like coronation"],
    ["🦁", "bro is the danger fr"],
    ["🚀", "straight to the top slab"],
    ["💅", "HR is already in your DMs"],
    ["🥶", "too cold to cook"],
    ["🏆", "dream company? just 'company'"],
    ["😤", "built different (with real projects)"],
    ["🤑", "CTC loading…"],
    ["🥳", "party at your place after the offer"],
    ["💯", "no notes. okay, one note."],
    ["🎯", "locked in"],
  ],
  blue: [
    ["🙂", "edible. respectable even."],
    ["👌", "decent. don't get comfy"],
    ["🧐", "recruiter is interested… cautiously"],
    ["🍞", "lightly toasted, very crunchy"],
    ["😏", "almost dangerous"],
    ["📈", "trending up, keep going"],
    ["🤏", "this close to elite"],
    ["🫶", "we see the effort"],
    ["🧃", "fresh but needs more juice"],
    ["🤓", "nerd energy, needs more proof"],
    ["🐢", "slow and steady… a bit too slow"],
    ["😮‍💨", "phew. survived. barely."],
    ["🤌", "chef's kiss, but the dish is small"],
  ],
  yellow: [
    ["😬", "yikes. medium yikes."],
    ["🥵", "it's getting hot in here"],
    ["🫤", "the vibes are mid"],
    ["⚠️", "placement officer is watching"],
    ["🤔", "recruiter is… thinking about it"],
    ["🙃", "we're so back? no. not yet."],
    ["🌡️", "temperature rising"],
    ["😐", "your resume said 'k'"],
    ["🫠", "melting under pressure"],
    ["🦥", "lock in, sloth mode is over"],
    ["🙄", "recruiter rolled their eyes"],
    ["🫨", "shaking for your OA"],
    ["⏳", "clock's ticking, chief"],
  ],
  orange: [
    ["😰", "start praying. then start building"],
    ["🥴", "this resume needs a doctor"],
    ["🍗", "well done. like, too well done"],
    ["🚨", "code orange. literally."],
    ["🙈", "recruiter closed the tab"],
    ["😵‍💫", "the ATS got dizzy reading this"],
    ["📉", "stonks going the wrong way"],
    ["🤡", "honk honk"],
    ["😭", "cooked AND seasoned"],
    ["🫣", "can't even look"],
    ["🐌", "your career's loading speed"],
    ["🪫", "low battery resume"],
    ["😱", "the HR scream"],
  ],
  red: [
    ["💀", "it's giving obituary"],
    ["🌋", "volcanic levels of kooked"],
    ["🗿", "recruiter's face reading this"],
    ["🫥", "your resume has left the chat"],
    ["😵", "flatlined"],
    ["🔥", "you ARE the fire now"],
    ["🧂", "salted, peppered, burnt to charcoal"],
    ["👻", "recruiters will ghost this"],
    ["🗑️", "straight to the recycle bin"],
    ["💥", "kaboom"],
    ["🤯", "how is this even legal"],
    ["😂", "we're laughing WITH you (we're not)"],
    ["🦖", "this resume belongs in a museum"],
    ["🛑", "stop. rebuild. now."],
  ],
  notResume: [
    ["🤨", "that's… not a resume"],
    ["🫵", "you. yes you. what is this"],
    ["🤡", "certified clown upload"],
    ["😂", "we laughed for 5 minutes"],
    ["🙄", "read the instructions, chief"],
    ["🗣️", "RESUME. we said RESUME."],
    ["🫢", "you did NOT just upload that"],
    ["💩", "what did you just feed the oven"],
    ["👀", "excuse me??"],
    ["😈", "now we roast YOU"],
    ["🤖", "even the AI is confused"],
    ["🍿", "the group chat needs to see this"],
    ["💸", "is this a bill? are you okay?"],
  ],
};

export const RAIN = {
  green: ["🎉", "🏆", "😎", "🔥", "💪", "👑", "🚀", "✨"],
  blue: ["👍", "✨", "📈", "🍞", "🙂"],
  yellow: ["💦", "😬", "🌡️", "⚠️", "🥵"],
  orange: ["🔥", "😰", "🚨", "💦", "📉"],
  red: ["💀", "🔥", "☠️", "⚰️", "🪦", "🚒", "🌋"],
  notResume: ["🤡", "😂", "🤨", "❓", "🙄", "💀"],
};

const RECENT_KEY = "kooked:recentReactions";

// Picks one sticker per result, avoiding the last few this browser has seen so repeat uploads feel fresh.
export function pickReaction(kind) {
  const pool = REACTIONS[kind] ?? REACTIONS.orange;
  let recent = [];
  try {
    recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    recent = [];
  }
  const fresh = pool.filter(([e]) => !recent.includes(e));
  const options = fresh.length ? fresh : pool;
  const choice = options[Math.floor(Math.random() * options.length)];
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([choice[0], ...recent].slice(0, 10)));
  } catch {
    /* storage blocked: still works, just might repeat */
  }
  return choice;
}

// Noto animated emoji (Google, CC BY 4.0). Code points joined by "_", without the FE0F selector.
export function stickerUrl(emoji) {
  const cps = Array.from(emoji)
    .map((c) => c.codePointAt(0).toString(16))
    .filter((c) => c !== "fe0f");
  return `https://fonts.gstatic.com/s/e/notoemoji/latest/${cps.join("_")}/512.webp`;
}
