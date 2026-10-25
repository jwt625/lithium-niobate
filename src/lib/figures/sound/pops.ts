// Chapter 03 method and convention popups (registered by every /sound/ page next to the generated reference entries
// "r:<id>" and chapter glossary entries "sg:<slug>" from content.server.ts).
import type { Pop } from "$lib/content/pops";

const K99 = "Kushibiki, Takanaga, Arakawa &amp; Sannomiya, IEEE Trans. UFFC 46, 1315 (1999), <a href='https://doi.org/10.1109/58.796136'>doi:10.1109/58.796136</a>";
const IEEE = "IEEE Std 176-1987, <a href='https://doi.org/10.1109/IEEESTD.1988.79638'>doi:10.1109/IEEESTD.1988.79638</a>";

export const SOUND_POPS: Record<string, Pop> = {
  "m-frame": {
    h: "Axis frame <span class='v'>IEEE-176-1987, +Z: d33&gt;0, +Y: d22&gt;0</span>",
    body: "Z along c with +Z such that d<sub>33</sub> &gt; 0 (the end that turns negative on compression); X along an a axis, perpendicular to a mirror plane; Y in the mirror plane with +Y such that d<sub>22</sub> &gt; 0; right-handed. In this frame c<sub>14</sub> &gt; 0 and e<sub>22</sub> &gt; 0. A 180&deg; rotation about Z flips c<sub>14</sub>, s<sub>14</sub>, e<sub>22</sub>, d<sub>22</sub>, p<sub>14</sub>, p<sub>41</sub>, r<sub>22</sub> together; flipping +Z flips every odd-rank tensor (e, d, r, &chi;<sup>(2)</sup>, pyroelectric p<sub>3</sub>) but not c or p.",
    badges: [["p", "P"]],
    src: `${IEEE}, Table 5, Sec. 3.2.5; signs of c<sub>14</sub>, e<sub>22</sub>: ${K99}; Weis &amp; Gaylord, Appl. Phys. A 37, 191 (1985) Table 6`,
  },
  "m-forms": {
    h: "Converted constants",
    body: "Computed in the page from kushibiki1999 c<sup>E</sup>, e, &epsilon;<sup>S</sup> with the IEEE 176 relations: s<sup>E</sup> = (c<sup>E</sup>)<sup>&minus;1</sup>, d = e s<sup>E</sup>, &epsilon;<sup>T</sup> = &epsilon;<sup>S</sup> + d e<sup>t</sup>, g = &beta;<sup>T</sup> d, h = &beta;<sup>S</sup> e, c<sup>D</sup> = c<sup>E</sup> + e<sup>t</sup> h, s<sup>D</sup> = s<sup>E</sup> &minus; d<sup>t</sup> g (engineering shear strain; c<sub>66</sub> = (c<sub>11</sub> &minus; c<sub>12</sub>)/2 enforced). Function: <span class='v'>piezo.convertForms</span>.",
    badges: [["d", "derived"]],
    src: `${IEEE}, Eqs. 37-43; inputs ${K99}, Tables IV-V`,
  },
  "m-christoffel": {
    h: "Christoffel equation with piezoelectric stiffening",
    body: "&Gamma;<sub>jk</sub> = c<sup>E</sup><sub>ijkl</sub>n<sub>i</sub>n<sub>l</sub> + (e<sub>mij</sub>n<sub>m</sub>n<sub>i</sub>)(e<sub>nkl</sub>n<sub>n</sub>n<sub>l</sub>)/(&epsilon;<sup>S</sup><sub>rs</sub>n<sub>r</sub>n<sub>s</sub>); &rho;v<sup>2</sup> are the eigenvalues, the eigenvectors are the polarizations. Group velocity from the gradient of &rho;v<sup>2</sup> with respect to n. Constants: kushibiki1999. Functions: <span class='v'>acoustics.christoffel</span>, <span class='v'>piezo.groupVelocity</span>.",
    badges: [["d", "derived"]],
    src: `${IEEE}, Eqs. 46-50; ${K99}`,
  },
  "m-saw": {
    h: "Partial-wave SAW solver",
    body: "Fields ~ exp[ik(x<sub>1</sub> + &alpha;x<sub>3</sub> &minus; vt)]; for each trial v the extended Christoffel system in (u<sub>1</sub>, u<sub>2</sub>, u<sub>3</sub>, &phi;) gives an octic in &alpha;; four roots decaying into the substrate (or radiating away from the surface for leaky waves) are kept; the velocity is the zero of the 4&times;4 boundary determinant: traction-free, and D<sub>3</sub> continuous with the vacuum (free) or &phi; = 0 (metallized). Leaky roots are complex; loss in dB per wavelength = 20 log<sub>10</sub>(e)&middot;2&pi;|Im v|/Re v. A 1 m/s window around each bulk velocity along x<sub>1</sub> is excluded (spurious minima); a minimum that stays at a window edge is reported as threshold-pinned, not a root. k<sup>2</sup> = 2(v<sub>free</sub> &minus; v<sub>met</sub>)/v<sub>free</sub>. Function: <span class='v'>saw.sawCut</span>.",
    badges: [["d", "derived"]],
    src: "Campbell &amp; Jones, IEEE Trans. Sonics Ultrason. 15, 209 (1968), <a href='https://doi.org/10.1109/T-SU.1968.29477'>doi:10.1109/T-SU.1968.29477</a>; Ingebrigtsen, J. Appl. Phys. 40, 2681 (1969), <a href='https://doi.org/10.1063/1.1658060'>doi:10.1063/1.1658060</a>",
  },
  "m-idt": {
    h: "IDT delta-function model (normalized)",
    body: "Array factor H(f) = sin X / (N sin(X/N)), X = N&pi;(f &minus; f<sub>0</sub>)/f<sub>0</sub>, f<sub>0</sub> = v/p with p the electrode period of one finger pair; radiation conductance shape (sin X / X)<sup>2</sup>, first nulls at f<sub>0</sub>(1 &plusmn; 1/N). The absolute conductance prefactor (k<sup>2</sup>, capacitance per pair, aperture) is not modelled. Functions: <span class='v'>saw.idtArrayFactor</span>, <span class='v'>saw.idtF0</span>.",
    badges: [["d", "derived"]],
    src: "Smith, Gerard, Collins, Reeder &amp; Shaw, IEEE Trans. Microw. Theory Tech. 17, 856 (1969), <a href='https://doi.org/10.1109/TMTT.1969.1127075'>doi:10.1109/TMTT.1969.1127075</a> (model lineage; prefactor not read)",
  },
  "m-bragg": {
    h: "Bragg geometry",
    body: "&Lambda; = v/f; sin &theta;<sub>B</sub> = &lambda;<sub>0</sub>/(2n&Lambda;) inside the crystal, sin &theta;<sub>B,ext</sub> = &lambda;<sub>0</sub>/(2&Lambda;) in air; the diffracted order moving with the sound is shifted up by f (energy and momentum conservation). n from the Zelmon et al. 1997 Sellmeier model (CLN, 0.4 to 5.0 &micro;m). Function: <span class='v'>ao.bragg</span>.",
    badges: [["d", "derived"]],
    src: "Zelmon, Small &amp; Jundt, JOSA B 14, 3319 (1997), <a href='https://doi.org/10.1364/JOSAB.14.003319'>doi:10.1364/JOSAB.14.003319</a>",
  },
  "m-pe": {
    h: "Rotated longitudinal photoelastic coefficient",
    body: "p'<sub>bbbb</sub> = p<sub>ijkl</sub>b<sub>i</sub>b<sub>j</sub>b<sub>k</sub>b<sub>l</sub> for an in-plane unit vector b (light polarization and dominant strain both along b), p<sub>ijkl</sub> from the asymmetric Voigt p<sub>IJ</sub> without factors. X-cut: b = (0, cos&phi;, sin&phi;), &phi; from +Y toward +Z; Y-cut: b = (cos&phi;, 0, sin&phi;), from +X toward +Z; Z-cut: b = (cos&phi;, sin&phi;, 0). Functions: <span class='v'>photoelastic.longitudinal</span>, <span class='v'>photoelastic.flipP14P41</span>.",
    badges: [["d", "derived"]],
    src: "Weis &amp; Gaylord, Appl. Phys. A 37, 191 (1985), Eqs. 18-19, Table 7, <a href='https://doi.org/10.1007/BF00614817'>doi:10.1007/BF00614817</a>",
  },
  "m-om": {
    h: "Transduction efficiency model",
    body: "&eta; = &eta;<sub>oc</sub>&eta;<sub>o</sub>&eta;<sub>m</sub>&middot;4C/(1 + C)<sup>2</sup> for a red-detuned pump (beam splitter; maximum at C = 1) and &eta;<sub>oc</sub>&eta;<sub>o</sub>&eta;<sub>m</sub>&middot;4C/(1 &minus; C)<sup>2</sup> for a blue-detuned pump (two-mode squeezing; diverges at C = 1, phonon lasing), C = C<sub>0</sub>n<sub>c</sub>, C<sub>0</sub> = 4g<sub>0</sub><sup>2</sup>/(&kappa;&gamma;). Reported parameters: &eta;<sub>oc</sub> = 0.652, &eta;<sub>o</sub> = 0.66, &eta;<sub>m</sub> = 9.9&times;10<sup>&minus;4</sup>, C<sub>0</sub> = 1.2&times;10<sup>&minus;5</sup> (fit). Function: <span class='v'>optomech.transductionEfficiency</span>.",
    badges: [["r", "reported"], ["d", "derived"]],
    src: "Jiang et al., Nat. Commun. 11, 1166 (2020), arXiv v1 Eq. 4 and App. A, CC BY 4.0, <a href='https://doi.org/10.1038/s41467-020-14863-3'>doi:10.1038/s41467-020-14863-3</a>",
  },
  "m-calc": {
    h: "Computed from the kushibiki1999 constants",
    body: "Value computed with the site physics code (src/lib/physics) from the kushibiki1999 c<sup>E</sup>, e, &epsilon;<sup>S</sup>, &rho; and checked against an independent scratch computation of 2026-10-25 within the stated tolerances.",
    badges: [["d", "derived"]],
    src: K99,
  },
  "m-vendor": {
    h: "Vendor values",
    body: "Fomos-Materials lithium niobate knowledge base: SAW velocity 3488 (Y-Z), 3980 (128&deg; Y-X), 4690 (64&deg; Y-X), 4750 (41&deg; Y-X) m/s; an undefined &quot;EMC coefficient&quot; 5.04, 5.7, 10, 17%; temperature coefficient of frequency &minus;95, &minus;72, &minus;70, &minus;70 ppm/K. Undated page; not traceable to a specific measurement.",
    badges: [["v", "V"]],
    src: "<a href='https://en.newpiezo.com/knowledge_base/1/lithium-niobate/'>en.newpiezo.com/knowledge_base/1/lithium-niobate/</a>, accessed 2026-10-25",
  },
};
