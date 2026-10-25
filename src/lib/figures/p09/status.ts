// Status codes of the data layer (src/lib/generated: P, P(abs), P-comp, P-db, S, V, C, U) and their badge classes.
export const STATUS_DEF: Record<string, string> = {
  P: "primary source read at the locator",
  "P(abs)": "only the abstract read",
  "P-comp": "read in a compilation that names the original measurement; original not read",
  "P-db": "CC0 database transcription of a primary source",
  S: "secondary source quoting the original",
  V: "vendor datasheet; not traceable to a specific measurement",
  C: "computed from listed inputs",
  U: "unverified: claimed value and claimed source; served only by the unverified endpoint",
};
export const statusCls = (s: string): string => ({ P: "p", "P-comp": "pc", "P-db": "pc", "P(abs)": "r", S: "s", V: "v", C: "d", U: "u" })[s] ?? "s";
