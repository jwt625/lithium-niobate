// "Lithium Niobate for Babies", 03 Sound: black-line woodcut (DevLog-007 sec. 7, DevLog-007b sec. 03).
// Gouge strokes follow wavefronts and displaced layers; black ink + one red. Art: src/lib/babies/books/sound/.

import type { BabyBook } from "../types";
import { P1_TEXT, p1Scene } from "./sound/p1-squeeze";
import { P2_TEXT, p2Scene } from "./sound/p2-surface";
import { P3_TEXT, p3Scene } from "./sound/p3-comb";
import { P4_TEXT, p4Scene } from "./sound/p4-light";

const book: BabyBook = {
  slug: "sound",
  title: "Sound",
  style: "black-line woodcut",
  pages: [
    {
      text: P1_TEXT,
      sec: "/sound/piezoelectricity/",
      note: "Piezoelectricity: squeeze LN along certain directions and charge appears on its faces, read as a voltage on the meter, not a spark. It needs a crystal without a centre of symmetry; LN (point group 3m) qualifies. Pressing along the Y axis gives about 2.3 times more charge than along the polar Z axis (d22 = 20.3 vs d33 = 8.7 pC/N) (ch03:L32). It also runs backwards: one volt moves the faces of a free crystal about 20 pm along Y (ch03:L32). Squash drawn far bigger than real.",
      scene: p1Scene,
    },
    {
      text: P2_TEXT,
      sec: "/sound/surface-waves/",
      note: "Surface acoustic wave (SAW): the ripple keeps its energy within about one wavelength of the top (ch03:L199); here the drawn swing falls as exp(-z/delta) with delta = wavelength/2.6 (drawing choice, consistent with ch03:L199). On LN it runs at about 3.4 to 4.0 km/s, 75,000 to 88,000 times slower than light; at 1 GHz the ripple is only 4 um long (ch03:L199), sound far too high to hear. Red dots: near the top the crystal moves in small loops, deep down it barely moves. Height exaggerated.",
      scene: p2Scene,
    },
    {
      text: P3_TEXT,
      sec: "/sound/idt-filters/",
      note: "Interdigital transducer (IDT): a voltage across the interleaved metal combs strains the surface under every finger gap; the ripples add up only at the frequency whose wavelength equals the comb period, so the comb is both launcher and filter; two facing combs make a delay line (ch03:L295). Tap: a shorter or longer ripple does not build up. A 2018 count put more than 50 acoustic filters (SAW and BAW, bulk acoustic wave) in a mid- to high-tier 4G phone, more than 70 expected with 5G (ch03:L295; vendor contribution in trade press, grade V). Many SAW filters sit on LN or its sister crystal lithium tantalate (LT), which appears to dominate SAW; BAW filters use aluminum nitride, not LN (ch06:L392, ch03:L306-L308).",
      scene: p3Scene,
    },
    {
      text: P4_TEXT,
      sec: "/sound/acousto-optics/",
      note: "Acousto-optics: the sound wave is a moving grating of squeezed and stretched crystal; the refractive index follows the strain, so light crossing it is diffracted and shifted in frequency by exactly the sound frequency (ch03:L325). LN launches the sound itself piezoelectrically, so no glued-on transducer is needed; the bar stands for electrodes on the crystal (ch03:L325). Bragg angle example: 1550 nm light, 1 GHz sound, 6.8 deg in air (ch03:L344); drawn at about 7 deg, stripe spacing not to scale.",
      scene: p4Scene,
    },
  ],
};

export default book;
