// Big sticker reactions on the result, picked at random per level and never the same twice in a row.
export const REACTIONS = {
  green: [
    ["🐐", "the GOAT has entered the TnP cell"],
    ["😎", "recruiters, form a queue"],
    ["🫡", "salute. no notes."],
    ["👑", "placement season? more like coronation"],
    ["🧊", "ice cold. barely warm."],
    ["🦁", "bro is the danger fr"],
    ["🚀", "straight to the top slab"],
    ["💅", "HR is DMing you already"],
    ["🥶", "too cold to cook"],
    ["🏆", "dream company? just 'company'"],
    ["🔥", "the only thing burning is your competition"],
    ["😤", "built different (with actual projects)"],
  ],
  blue: [
    ["🙂", "edible. respectable even."],
    ["👌", "decent. now don't get comfy"],
    ["🧐", "recruiter is interested... cautiously"],
    ["🍞", "lightly toasted, very crunchy"],
    ["😏", "almost dangerous"],
    ["📈", "trending up, keep going"],
    ["🤏", "this close to elite"],
    ["🫶", "we see the effort"],
    ["🥪", "solid sandwich of a resume"],
    ["🧃", "fresh but needs more juice"],
  ],
  yellow: [
    ["😬", "yikes. medium yikes."],
    ["🥵", "it's getting hot in here"],
    ["🫤", "the vibes are mid"],
    ["⚠️", "placement officer is watching"],
    ["🥩", "medium rare and sweating"],
    ["🤔", "recruiter is... thinking about it"],
    ["🙃", "we're so back? no. not yet."],
    ["🌡️", "temperature rising"],
    ["😐", "your resume said 'k'"],
    ["🫠", "melting under pressure"],
  ],
  orange: [
    ["😰", "start praying. then start building"],
    ["🥴", "this resume needs a doctor"],
    ["🍗", "well done. like, too well done"],
    ["🚨", "code orange. literally."],
    ["🙈", "recruiter closed the tab"],
    ["😵‍💫", "the ATS got dizzy reading this"],
    ["🧯", "grab the extinguisher"],
    ["📉", "stonks going the wrong way"],
    ["🤡", "honk honk, it's a clown resume"],
    ["😭", "cooked AND seasoned"],
  ],
  red: [
    ["💀", "it's giving obituary"],
    ["⚰️", "RIP to this resume"],
    ["🪦", "here lies: your CV, 2026"],
    ["☠️", "fully cremated"],
    ["🚒", "fire brigade is on the way"],
    ["🌋", "volcanic levels of cooked"],
    ["🗿", "recruiter's face reading this"],
    ["🫥", "your resume has left the chat"],
    ["😵", "flatlined"],
    ["🔥", "you ARE the fire now"],
    ["🧂", "salted, peppered, burnt to charcoal"],
    ["📢", "attention: this is not a drill"],
  ],
};

export const RAIN = {
  green: ["🎉", "🏆", "😎", "🔥", "💪", "👑", "🚀", "✨"],
  blue: ["👍", "✨", "📈", "🍞", "🙂"],
  yellow: ["💦", "😬", "🌡️", "⚠️", "🥵"],
  orange: ["🔥", "😰", "🧯", "🚨", "💦"],
  red: ["💀", "🔥", "☠️", "⚰️", "🪦", "🚒", "🌋"],
};

const LAST_KEY = "kooked:lastReaction";

export function pickReaction(color, exclude) {
  const pool = REACTIONS[color] ?? REACTIONS.orange;
  let last = exclude;
  if (last === undefined) {
    try {
      last = localStorage.getItem(LAST_KEY);
    } catch {
      last = null;
    }
  }
  const options = pool.filter(([e, t]) => `${e}${t}` !== last);
  const choice = options[Math.floor(Math.random() * options.length)] ?? pool[0];
  try {
    localStorage.setItem(LAST_KEY, `${choice[0]}${choice[1]}`);
  } catch {
    /* storage blocked: still works, just might repeat */
  }
  return choice;
}
