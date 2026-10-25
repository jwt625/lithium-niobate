// Chapter 04 shared figure state: the pyroelectric coefficient choice of fig-04-07 (4.6) carries over to the pitfall cards
// of fig-04-11 (4.10) within a session (client-side navigation keeps this module alive). Plain object; components copy it
// into local state on init and write back on change.
export type P3Choice = "savage1966" | "schwesyg2011" | "cti1999" | "popescu2013" | "spread";
export const quirks: { p3: P3Choice } = { p3: "spread" };
