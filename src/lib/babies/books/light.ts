// "Lithium Niobate for Babies", 02 Light: medieval stained glass (lead came + backlit panes; DevLog-007b).
// Light travels pane by pane through leaded channels. Art: src/lib/babies/books/light/.

import type { BabyBook } from "../types";
import { TEXT1, waveScene } from "./light/p1-wave";
import { TEXT2, switchScene } from "./light/p2-switch";
import { TEXT3, greenScene } from "./light/p3-green";
import { TEXT4, ridgeScene } from "./light/p4-ridge";

const book: BabyBook = {
  slug: "light",
  title: "Light",
  style: "medieval stained glass",
  pages: [
    {
      text: TEXT1,
      sec: "/light/birefringence/",
      note: "Birefringence: light polarized along the c axis (the arrow) sees n_e, light polarized across it sees n_o, and n_e < n_o, so the along-arrow wiggle is the faster one (ch02:L17). At 1550 nm n_o = 2.2111, n_e = 2.1376 (ch02:L17); at 632.8 nm 2.28646 and 2.20222 (ch02:L50). Inside, the crests move about 2.2 times slower than in vacuum (phase velocity c/n, derived from ch02:L17). Two speeds appear for light crossing the arrow; light along the arrow has one (ch01:L369). The two wiggles share one beam; drawn apart for clarity, with the speed difference drawn much bigger than real. Light drawn white for any colour.",
      scene: waveScene,
    },
    {
      text: TEXT2,
      sec: "/light/pockels-effect/",
      note: "Pockels effect: a field along c shifts n_e by -(1/2) n_e^3 r33 E (ch02:L105); 1 V/um changes n_e by about 1.5e-4 at 1550 nm (ch02:L107). The beam does not bend; only the timing (phase) of the crests shifts. A Mach-Zehnder modulator splits the light and rejoins it: T = cos^2(pi V / (2 V_pi)); a 9 mm thin-film device needs V_pi = 2.90 V at 1550 nm, infrared (ch02:L109). Dark here means the light leaves elsewhere; it is not destroyed. Crest shift drawn much bigger than real.",
      scene: switchScene,
    },
    {
      text: TEXT3,
      sec: "/light/second-order/",
      note: "Second-harmonic generation: two photons merge into one at twice the frequency, carrying their combined energy (ch02:L213); here 1064 nm infrared to 532 nm green (ch02:L265). Infrared is invisible: drawn as dashed dark red, false colour. Without stripes the green slips out of step and converts back after each coherence length, 3.409 um for 1064 nm (ch02:L270). Flipping the domain every coherence length (bulk period 6.818 um, ch02:L265) keeps it growing. Stripe count and brightness not to scale.",
      scene: greenScene,
    },
    {
      text: TEXT4,
      sec: "/light/tfln-waveguides/",
      note: "Thin-film LN: a crystalline film, 300 to 900 nm thick in one supplier's range, bonded on silica; partial etching leaves a rib on a thinner slab, e.g. 300 nm film, 120 nm slab, 3.5 um rib (ch02:L462). The index contrast to the silica keeps the light in the rib and allows tight bends; measured loss 0.27 dB/cm on 4- and 6-inch wafers (ch02:L462). Layers drawn much thicker than real.",
      scene: ridgeScene,
    },
  ],
};

export default book;
