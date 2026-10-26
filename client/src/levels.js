// Stamp-ink colours per score level (labels/taglines come from the server).
export const LEVEL_COLORS = {
  green: { hex: "#2f9a5f", soft: "rgba(47,154,95,0.18)", band: "RAW" },
  blue: { hex: "#2f78b8", soft: "rgba(47,120,184,0.18)", band: "RARE" },
  yellow: { hex: "#c68f00", soft: "rgba(198,143,0,0.2)", band: "MEDIUM" },
  orange: { hex: "#dc5f17", soft: "rgba(220,95,23,0.2)", band: "WELL DONE" },
  red: { hex: "#cf2a22", soft: "rgba(207,42,34,0.2)", band: "BURNT" },
};

export const colorFor = (level) => LEVEL_COLORS[level?.color] ?? LEVEL_COLORS.orange;
