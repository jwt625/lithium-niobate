// Theme colours for the 3D scenes. Values mirror the VISUAL tokens (DevLog-003b sec. 3.3, src/lib/styles/visual.css);
// when the page defines the CSS custom properties they win, so a token change reaches the scenes without a code edit.
import type { Theme } from "./types.ts";

export interface Palette {
  theme: Theme;
  ink0: string; // page field
  ink1: string; // card surface
  ink2: string; // raised surface
  line: string;
  line2: string;
  text: string;
  text2: string;
  text3: string;
  au: string;
  si: string;
  ln: string;
  acc: string; // 532 nm accent
  ir1550: string; // declared false colour (always dashed)
}

const FALLBACK: Record<Theme, Palette> = {
  dark: {
    theme: "dark", ink0: "#05060a", ink1: "#0a0d13", ink2: "#111621", line: "#222a38", line2: "#364258",
    text: "#efe9db", text2: "#bdb7a8", text3: "#8a8578", au: "#dcaa4a", si: "#6e788a", ln: "#efe4c2", acc: "#45ff9c", ir1550: "#e252b0",
  },
  light: {
    theme: "light", ink0: "#f3efe3", ink1: "#fbf8ef", ink2: "#ece6d6", line: "#d6cfbd", line2: "#a99f88",
    text: "#16140f", text2: "#4a463c", text3: "#77705f", au: "#8a6410", si: "#5a6474", ln: "#b49a52", acc: "#1d7c49", ir1550: "#a8247e",
  },
};

const TOKENS: [keyof Palette, string][] = [
  ["ink0", "--v-ink0"], ["ink1", "--v-ink1"], ["ink2", "--v-ink2"], ["line", "--v-line"], ["line2", "--v-line2"],
  ["text", "--v-text"], ["text2", "--v-text2"], ["text3", "--v-text3"], ["au", "--v-au"], ["si", "--v-si"],
  ["ln", "--v-ln"], ["acc", "--v-l532"], ["ir1550", "--v-ir1550"],
];

/** Theme of the document (<html data-theme>), dark by default. */
export function documentTheme(): Theme {
  return typeof document !== "undefined" && document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Palette for a theme: CSS tokens of the page when present and the page is in that theme, else the fallback table. */
export function palette(theme: Theme): Palette {
  const p: Palette = { ...FALLBACK[theme] };
  if (typeof document === "undefined" || documentTheme() !== theme) return p;
  const cs = getComputedStyle(document.documentElement);
  for (const [k, v] of TOKENS) {
    const s = cs.getPropertyValue(v).trim();
    if (/^#[0-9a-f]{6}$/i.test(s)) (p as unknown as Record<string, string>)[k] = s;
  }
  return p;
}
