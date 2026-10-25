import { loadSection, type Cite } from "$lib/figures/making/load";

const cites: Cite[] = [
  ["src:rot", "Crystal-to-wafer rotation", "Derived: rows of R are the wafer axes in crystal coordinates (IEEE Std 176-1987 crystal frame); x = propagation, z = wafer normal; rotated Y-cut (YXl)θ turns +Y toward +Z. Euler ZXZ: R = Rz(α) Rx(β) Rz(γ).", "ieee176", "", "derived"],
  ["src:reff", "Engaged Pockels coefficient", "Derived: r_eff = Σ p<sub>i</sub> p<sub>j</sub> r<sub>ijk</sub> f<sub>k</sub> with the clamped Turner 1966 set (r13 8.6, r22 3.4, r33 30.8, r51 28 pm/V, 633 nm). No 1550 nm values are held.", null, "", "derived"],
  ["src:turner", "Turner 1966 clamped EO set", "P-comp: compilation table of Weis and Gaylord 1985.", null, "", "P-comp"],
  ["src:flat", "Wafer flat", "Template: flat length and orientation relative to ±X and the sign of +Z are vendor-specific; no primary or standard text read.", null, "", "template"],
  ["src:shibayama", "128° rotated Y-cut for SAW (1976)", "P(title): only the title and metadata were checked.", "shibayama1976", "", "P"],
  ["src:smm", "Sumitomo Metal Mining 128° Y LN wafers", "Company statement about its own products, opened and read.", "R09:S3", "", "V"],
];
export const load = () => loadSection("5.3", { cites, description: "Chapter 5.3: lithium niobate wafers, x-, y-, z- and 128 degree Y-X cuts, the Pockels coefficient each cut engages, wafer sizes and the gaps in public wafer specifications." });
