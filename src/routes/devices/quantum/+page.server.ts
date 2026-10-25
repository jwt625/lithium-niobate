// 6.7 Quantum devices: manuscript text and F6.11 transducer efficiency vs year.
import { buildSection, meta, refList } from "$lib/figures/devices/server";
import { TX_BASE, TX_DEFAULT, txPlot, type TxRow } from "$lib/figures/devices/f611";

export const load = async () => {
  const refs = await refList();
  const rows: TxRow[] = TX_BASE.map((r) => { const f = refs.get(r.ref); return { ...r, yr: Number(f?.year ?? 0), link: f?.doi ? `https://doi.org/${f.doi}` : undefined }; });
  const b = await buildSection("6.7", TX_BASE.map((r) => r.ref), [], ["reported"]);
  return {
    meta: meta("6.7", "Quantum devices", "Chapter 6.7: squeezed light, photon pairs, quantum frequency conversion and microwave-optical transducers in lithium niobate.", b.keys),
    b, f611: { rows, init: { T: txPlot(rows, TX_DEFAULT, 1100, 280, "tech"), V: txPlot(rows, TX_DEFAULT, 1200, 360, "visual") } },
  };
};
