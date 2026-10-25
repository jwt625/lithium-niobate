// Chapter 06 section registry (routes under /devices/). Mirrors the site.ts patch reported to the integration lane.
export interface DevSec { no: string; slug: string; title: string; short: string }
export const DEV_SECTIONS: readonly DevSec[] = [
  { no: "6.1", slug: "modulators", title: "Electro-optic modulators", short: "Modulators" },
  { no: "6.2", slug: "traveling-wave", title: "Traveling-wave design: velocity, impedance, RF loss", short: "Traveling wave" },
  { no: "6.3", slug: "tradeoffs", title: "The VπL, bandwidth, footprint trade", short: "VπL vs bandwidth" },
  { no: "6.4", slug: "frequency-conversion", title: "Frequency converters: PPLN SHG, SFG, DFG", short: "PPLN converters" },
  { no: "6.5", slug: "parametric", title: "Optical parametric amplifiers and oscillators", short: "OPA and OPO" },
  { no: "6.6", slug: "combs", title: "Frequency combs and frequency shifters", short: "Combs and shifters" },
  { no: "6.7", slug: "quantum", title: "Quantum devices: squeezers, pair sources, converters, transducers", short: "Quantum devices" },
  { no: "6.8", slug: "acousto-optics", title: "Acousto-optic and optomechanical devices", short: "Acousto-optics" },
  { no: "6.9", slug: "rf-filters", title: "RF acoustic filters", short: "RF filters" },
  { no: "6.10", slug: "heterogeneous", title: "Heterogeneous lasers, amplifiers, detectors", short: "Heterogeneous" },
  { no: "6.11", slug: "tantalate", title: "Thin-film lithium tantalate: the sibling platform", short: "TFLT" },
  { no: "6.12", slug: "records", title: "Records (provisional)", short: "Records" },
];
export const secHref = (s: DevSec): string => `/devices/${s.slug}/`;
export const secByNo = (no: string): DevSec => DEV_SECTIONS.find((s) => s.no === no) as DevSec;
