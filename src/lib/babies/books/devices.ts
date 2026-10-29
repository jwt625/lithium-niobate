// "Lithium Niobate for Babies", 06 Devices: Constructivism after the method of El Lissitzky's
// "About Two Squares" (1922): flat red / black primitives on diagonals, letterpress print. Art: ./devices/.
import type { BabyBook } from "../types";
import { modulatorScene } from "./devices/p1-modulator";
import { colorsScene } from "./devices/p2-colors";
import { combScene } from "./devices/p3-comb";
import { filterScene } from "./devices/p4-filter";

const book: BabyBook = {
  slug: "devices",
  title: "Devices",
  style: "Constructivism (after El Lissitzky, About Two Squares, 1922)",
  pages: [
    {
      text: "A modulator blinks laser light: on, off, on. That is a message!",
      sec: "/devices/modulators/",
      note: "The modulator does not make light; it changes light from a laser. A voltage changes the refractive index in one path and shifts the phase of its light; where the two paths rejoin, in step gives bright, out of step gives dark (ch06:L57, transfer curve ch06:L67). In thin-film LN the gold electrodes sit a few microns apart (median gap 5.0 um over 144 TFLN device rows), so a few volts are enough (ch06:L57). Drawn as single-path drive; many chips drive both paths push-pull (ch06:L70).",
      scene: modulatorScene,
    },
    {
      text: "Two bits of light join into one new color. Or one splits into two!",
      sec: "/devices/frequency-conversion/",
      note: "Frequency doubling: two photons become one with twice the energy, so twice the frequency and half the wavelength; stripes of flipped polarization keep the waves in step (ch06:L228). One thin-film waveguide converted more than 80 % of a 20 mW pump in a single pass (ch06:L228, chen2024nn, arXiv). Run backwards, one pump photon splits into two lower-energy photons whose energies add up to it; inside a ring this oscillates once gain beats loss, giving colors no laser diode emits (ch06:L262). Square area = energy, tail = wavelength.",
      scene: colorsScene,
    },
    {
      text: "One color goes in. A comb of many colors comes out!",
      sec: "/devices/combs/",
      note: "A microwave drives a low-loss LN ring at exactly its round-trip frequency; each pass adds sidebands, so the output lines are evenly spaced by the drive frequency (ch06:L293, ch02:L419). A TFLN microring made more than 900 lines at about 10 GHz spacing (ch06:L301, zhang2019). Tap to switch the microwave off: the single laser line passes alone.",
      scene: combScene,
    },
    {
      text: "Tiny sound ripples help a phone hear the right radio. Now you know the devices!",
      sec: "/devices/rf-filters/",
      note: "A phone picks its radio bands with tiny acoustic filters; a 2018 count put more than 50 in a mid- to high-tier 4G phone (ch06:L392, ch06:L403, R09 S50). Many are surface-acoustic-wave filters on lithium tantalate or lithium niobate, and the comb-electrode finger pitch sets the frequency (ch06:L392). LT appears to dominate SAW filters (no public share figure); bulk-acoustic-wave filters use aluminum nitride, not LN (ch06:L392). Only a signal matching the finger rhythm makes a strong ripple that reaches the second comb.",
      scene: filterScene,
    },
  ],
};

export default book;
