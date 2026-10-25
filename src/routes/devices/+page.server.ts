// 06 Devices chapter opener (manuscript 6.0): definition, F6.01 device map, families and maturity, section index.
import { buildSection, meta } from "$lib/figures/devices/server";

export const load = async () => {
  const b = await buildSection("6.0", ["R09"], [], ["V"]);
  return { meta: { ...meta("06", "Devices", "Chapter 06: lithium niobate devices from modulators and frequency converters to RF filters, quantum devices and thin-film lithium tantalate, with dated maturity evidence.", b.keys), title: "Devices" }, b };
};
