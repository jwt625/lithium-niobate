// Chapter 08 figure state shared by the TECH and VISUAL variants of the platform charts (F8.05).
export type Metric8 = "max_baud_gbd" | "max_line_rate_gbps" | "max_net_rate_gbps";
export const plat8 = $state({
  tab: "B1" as "B1" | "B2" | "B3" | "B4" | "B5" | "B6",
  year: 2026, allBands: false, allConv: false, design: false, hidden: [] as string[], playing: false,
  metric: "max_baud_gbd" as Metric8, scheme: "all" as "all" | "imdd" | "coh", log: false,
  exclOFC: false,
});
