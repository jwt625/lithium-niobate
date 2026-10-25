// Chapter 08 section registry (landing index, crumbs, prev/next). Mirrors the site.ts entry reported for integration.
export interface Sec8 { no: string; slug: string; title: string; figs: string; icon: string }
export const SECTIONS8: Sec8[] = [
  { no: "8.1", slug: "rock-to-chip", title: "Rock to chip", figs: "value chain; niobium per wafer", icon: "ore" },
  { no: "8.2", slug: "who-makes-it", title: "Who grows, slices, fabs, and builds", figs: "companies by stage and region", icon: "grid" },
  { no: "8.3", slug: "wafers-and-lanes", title: "Wafer size and lane rate", figs: "wafer sizes; lane rates", icon: "wafer" },
  { no: "8.4", slug: "platforms", title: "Platform comparison from the atlas", figs: "six atlas charts; platform cards", icon: "scatter" },
  { no: "8.5", slug: "ofc-2026", title: "OFC 2026 snapshot", figs: "OFC 2026 board", icon: "board" },
  { no: "8.6", slug: "market", title: "Market size: ranges by evidence grade", figs: "range strips by publisher", icon: "strips" },
  { no: "8.7", slug: "in-your-life", title: "LN in your life", figs: "ten cards", icon: "phone" },
  { no: "8.8", slug: "events", title: "Events, 2020-2026", figs: "event timeline", icon: "timeline" },
];
export const secHref = (s: Sec8): string => `/industry/${s.slug}/`;
export const crumbs8 = (no: string): { label: string; href?: string }[] => [{ label: "lithium niobate", href: "/" }, { label: "08 Industry", href: "/industry/" }, { label: no }];
