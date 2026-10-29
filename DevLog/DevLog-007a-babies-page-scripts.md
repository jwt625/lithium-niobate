# Baby mode: picture-book scripts (proposal, 2026-10-28)

Scope: one cover book (landing) + eight chapter books. Each page: read-aloud text / picture / interaction / grown-up section.
Paths are repo-relative. `ch01:L134` = `content/chapters/01-crystal/manuscript.md` line 134 (same pattern for ch02-ch08). `ev:L159` = `content/chapters/07-history/events.yaml` line 159. Numbers sit in the "Numbers" list under each book; a page uses no number that is not listed there.

Drawing conventions (all books, so pictures never contradict the grown-up pages):
- The crystal is always drawn with its arrow (the polar c axis, + end up). Same arrow glyph in every book.
- Infrared is invisible: draw it as a dashed dark-red beam marked "false color" (same rule as the site's declared false color, ch06:L29).
- Deformations, ripples, and crystal shifts are exaggerated; mark them "drawn much bigger than real" in the hover note.
- Balls: O = large balls; Li and Nb = small balls of similar size told apart by color and label, never by size (do not draw Nb bigger: the Nb ion is not the larger one, and ch01:L303 states the Li octahedron is the larger room). These are ions; the text says "balls".

---

## 0. Cover book (landing page), 10 pages

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | This is a crystal. | One clear, pale, faceted block centered on a plain field. | Tap: a glint sweeps across it. | / |
| 2 | It is made of tiny balls: lithium, niobium, and oxygen. | Magnifier circle on the block showing many large O balls with small Li and Nb balls (colored) between them. | Drag the magnifier over the block. | 1.1 |
| 3 | Inside, everything leans the same way. Up! | Grid of cells, each with the same small up arrow. | Tap: arrows pulse in a wave. | 1.2 |
| 4 | Shine light through it. A voltage changes how fast the light's waves go. | Beam crossing the block, small battery wired to two gold strips; crest spacing changes. | Slider: voltage; crests inside shift. | 2.2 |
| 5 | Squeeze it, and electric charge appears. | Two hands press the block; + on one face, - on the other. | Press and hold: signs appear; release: they fade. | 3.1 |
| 6 | It has quirks. Warm it, and charge appears too. | Block on a hotplate; + and - signs on top and bottom faces. | Slider: temperature; signs grow. | 4.6 |
| 7 | People grow it from a glowing melt and slice it very thin. | Crucible with a boule rising, then one thin slice. | Drag up: boule grows. | 5.2 |
| 8 | It helps send the internet through glass fibers, and helps phones pick their radio. | Fiber spool with blinking light; phone outline with small chips. | Tap either object: it lights. | 6.1, 8.7 |
| 9 | People found its flip-able arrow in 1949. | Timeline ribbon with one dot at 1949; arrow flipping. | Tap the dot: arrow flips. | 7.1 |
| 10 | Now you know lithium niobate! | The block with eight small doors around it, one per chapter. | Each door opens that chapter's baby book. | / |

Numbers: 1949 (ev:L159, h-1949-matthias-remeika, status V).
Flags: p4 avoids "electricity bends light" (see ch02 flags). p5 avoids "spark" (see ch03 flags).

---

## 01 Crystal, 14 pages

Cumulative object: one oxygen ball -> a flat sheet -> stacked sheets with rooms -> Li, Nb, empty -> arrow -> flipped patches -> stripes.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | This is a ball. It is oxygen. | One O ball. | Tap: it bounces. | 1.1 |
| 2 | Many oxygen balls make a flat sheet. | Hexagonal close-packed layer of O balls. | Drag balls in to fill the sheet. | 1.1 |
| 3 | Stack the sheets. Between them are little rooms. | Two stacked sheets; one hole highlighted with its six O neighbors. | Tap a hole: its six walls light up. | 1.1 |
| 4 | Niobium in one room. Nobody in the next. Lithium in the next. Again and again. | Vertical column of rooms along the arrow axis: Nb, empty, Li, repeating. | Tap: rooms fill in order. | 1.1 |
| 5 | Turn it one third of the way around. It looks the same! | Top view of the pattern; 120 degree turn arrow; three mirror lines. | Drag to rotate; it clicks "same" at 120 and 240 degrees only. | 1.1, 1.7 |
| 6 | When it is very, very hot, it looks the same upside down. | Glowing block, ions centered in their rooms, thermometer high. | Tap: flip the picture; nothing changes. | 1.2 |
| 7 | As it cools, lithium and niobium both scoot the same way. Now every room leans up. | Same column, Li and Nb shifted along the axis; small up arrow per cell. | Slider: temperature down; ions slide and arrows appear at the Curie mark. | 1.2 |
| 8 | The lean stays, almost until the crystal melts. | Thermometer with two marks close together: "arrow lost" and "melts". | Slider: heat up; arrows vanish just below the melt mark. | 1.3 |
| 9 | About one lithium room in twenty has no lithium in it. | Grid of 20 Li rooms, one without lithium; a 100-room zoom shows 4 empty rooms and 1 room holding a niobium. | Tap: count the empty rooms. | 1.4, 1.5 |
| 10 | Other balls can move in. Iron makes trouble. Magnesium helps. | Li rooms with a few Fe and Mg balls. | Tap Fe: a small light-mark appears; tap Mg: it fades (link to ch04). | 1.6 |
| 11 | A big push of voltage can flip the lean from up to down. | Electrodes on top and bottom; region of arrows flipping. | Slider: voltage; past the threshold the arrows flip. | 1.8 |
| 12 | Flipped patches grow as six-sided shapes. | Top view: hexagonal domains spreading. | Tap: a hexagon grows from a seed. | 1.8 |
| 13 | Flip it in stripes: up, down, up, down. Where up meets down, there is a very thin wall. | Comb electrode on top; alternating arrow stripes below; walls as hairlines. | Drag the comb across; stripes flip under its teeth. | 1.9, 1.10 |
| 14 | Now you know the lithium niobate crystal! | Stacked sheets, Li/Nb/O, striped arrows, all from earlier pages. | Tap any part: jumps back to its page. | 1.1 |

Numbers (parent hover only, not read aloud):
- p6-7: Curie temperature about 1140 C, congruent (ch01:L90, ch01:L134; `data/properties/scalars-ferroelectric.yaml` id `curie-temperature/cln/volk2008`).
- p8: melts at 1255 C, 115 degrees above the Curie temperature (ch01:L134; id `melting-point/cln/volk2008`).
- p9: about 1 Li room in 20 holds no lithium (ch01:L179); about 1 in 100 holds a niobium, about 4 in 100 are empty (ch01:L231).
- p10: magnesium above about 5 mol% MgO cuts optical damage more than a hundredfold (ch01:L305).
- p11: about 21 kV per mm in congruent crystal (ch01:L422; id `coercive-field/cln/volk2008`).

Flags:
- "Lithium niobate is a rock / found in the ground" is false: it does not occur in nature (ch01:L28). Say "people make it". (The ore in ch05/ch08 is a niobium mineral, not LN.)
- "The arrow is a magnet" is false: it is an electric polarization, not magnetic. Say "leans" / "arrow"; hover: "built-in electric polarization".
- "Lithium makes the arrow" is incomplete in a misleading way: both Li and Nb shift relative to the oxygen frame (ch01:L90). Text on p7 names both.
- p9: "one in twenty are empty" would be wrong: of the rooms without lithium, about 4 in 100 are empty and about 1 in 100 holds a niobium (ch01:L231). Read-aloud therefore says "has no lithium in it", and the zoom picture shows the split.
- p12: "six-sided" is the observed growth shape in LN (ch01:L424); do not generalize to all ferroelectrics.

---

## 02 Light, 14 pages

Cumulative object: a beam -> its wave -> its wiggle direction -> slower inside -> two speeds -> voltage changes speed -> two paths meet -> thin wire -> light bits join -> stripes keep them in step -> one bit splits.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | This is a beam of light. | Straight beam across the page from a small laser box. | Tap the box: beam on. | 2.1 |
| 2 | Light is a wave. Its crests march along. | Sine wave drawn along the beam. | Animation: crests move left to right. | 2.1 |
| 3 | The wave wiggles one way: up and down, or side to side. | Two beams, one wiggling vertically, one horizontally. | Tap: toggle wiggle direction. | 2.1 |
| 4 | Inside the crystal, the wave goes slower than in air. Its crests bunch up. | Wave enters the block; crest spacing shrinks inside, recovers outside. | Animation: crests slow at the face. | 2.1 |
| 5 | Wiggle along the crystal's arrow: a little faster. Wiggle across it: a little slower. | Block with up arrow; two waves crossing it side by side with different crest spacing. | Drag: rotate the wiggle direction; crest spacing changes. | 2.1 |
| 6 | Add a voltage. The wave's speed changes, just a tiny bit. | Battery wired to gold strips beside the beam; crests shift (exaggerated). | Slider: voltage; crest positions slide. | 2.2 |
| 7 | Split the light into two paths. Then bring them back together. | Y split, two arms, Y join (Mach-Zehnder outline). | Animation: waves run both arms. | 2.2 |
| 8 | Crests meet crests: bright! Crests meet dips: dark. | Output lamp bright or dark; two small waves adding or cancelling. | Slider: voltage on one arm; lamp follows a smooth bright-dark curve. | 2.2 |
| 9 | Make the crystal a very thin ridge on glass. The light stays inside, even around bends. | Cross-section: thin LN film on silica, a rib with a glowing mode spot; top view with a bend. | Drag: bend radius; light stays in. | 2.7 |
| 10 | Light comes in tiny bits. Two infrared bits can join into one green bit. | Two dashed dark-red dots (false color) merging into one green dot. | Tap: dots merge. | 2.3 |
| 11 | But the green wave slips out of step. The green fades back. | Crystal with green brightness rising then falling along its length. | Animation: green grows, then shrinks, repeating. | 2.3 |
| 12 | Flip the arrow in stripes. Each stripe pushes in step again. The green keeps growing. | Striped crystal; green grows steadily. | Toggle stripes on/off; compare output. | 2.3 |
| 13 | Run it backward: one bit splits into two. | One green dot splitting into two dashed red dots of different shades, inside a ring. | Tap: split. | 2.4 |
| 14 | Now you know light in lithium niobate! | The striped crystal, the two-path chip, and the ring together. | Tap any part: back to its page. | 2.1 |

Numbers (hover):
- p4-5: at 1550 nm, n_o = 2.2111, n_e = 2.1376 (ch02:L17; `data/dispersion/zelmon1997.yaml`). So the wave crests move a bit over 2 times slower than in vacuum; along-arrow wiggle (n_e) is faster.
- p12: stripes "every few micrometres" (ch01:L482); in TFLN a period near 4 um (ch02:L213). No number read aloud: the 18.99 um bulk period (ch02:L213) is for 1550 -> 775 nm, not green.

Flags:
- "Light slows down" (p4): acceptable only as "the wave goes slower" (phase velocity c/n). Do not say light "gets tired", "bumps into atoms", or "is stopped and re-sent". Do not imply the light loses energy.
- p5: two speeds exist only for light crossing the arrow. Light traveling along the arrow sees one speed (ch02:L17, ch01:L369). Text keeps "crossing" in the picture; hover states it.
- "Electricity bends light" (p6) is wrong for the Pockels effect: the voltage changes the index, which shifts the wave's timing (phase). Brightness changes only after the two paths recombine (p8). Never draw the beam bending.
- p8 "dark": the light is not destroyed; it leaves elsewhere. Say "dark here", never "the light disappears".
- "The crystal makes new colors" / "paints the light green" (p10) is wrong as energy accounting: two infrared bits join into one bit carrying both their energy (twice the frequency, half the wavelength). The crystal adds no energy. Use 1064 -> 532 nm green for the picture (events.yaml ev:L231 hook "Infrared in, green out"; ch08:L308). Telecom 1550 nm doubles to 775 nm, which is not green.
- p11: without stripes the green does not just "stop growing"; it converts back after one coherence length (ch02:L213). The read-aloud "fades back" keeps that.
- p13: the two new bits' energies add up to the pump's; draw them as two different reds, not two greens.

---

## 03 Sound, 14 pages

Cumulative object: a squeeze -> charge -> backward (voltage -> shape) -> wiggle -> ripple on the surface -> comb -> filter -> phone -> sound stripes and light.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | This is a crystal. Let's squeeze it. | Two hands pressing a block. | Press and hold. | 3.1 |
| 2 | Squeeze it, and electric charge appears on its faces. | + on one face, - on the other; small meter needle moves. | Press: signs and needle; release: back to zero. | 3.1 |
| 3 | Squeeze it from the side, and you get even more. | Press along Y vs along the arrow (Z); bigger needle for Y. | Pick press direction; needle size changes. | 3.1 |
| 4 | Run it backward. Give it a voltage, and it changes shape, a tiny bit. | Battery; block bulges (exaggerated, labeled). | Toggle battery: bulge. | 3.1 |
| 5 | Wiggle the voltage, and the crystal wiggles. The wiggle travels: that is sound. | Alternating source; wave fronts moving through the block. | Slider: wiggle rate; wave spacing changes. | 3.2 |
| 6 | Some sound hugs the surface, like a ripple on a pond. | Wavy top surface; dots near the top move in small loops, deep dots still. | Animation: ripple travels; dots orbit. | 3.3 |
| 7 | The ripple is much, much slower than light. | Long track: a light streak gone off the page; ripple barely moved. | Tap "go": both start; compare. | 3.3 |
| 8 | Cut the crystal at just the right tilt. The ripple you want is strong, and the one you don't want almost vanishes. | Boule with a tilted cutting plane and an angle marker. | Drag the cut angle; two bars (wanted, unwanted) change; best near 128. | 3.4 |
| 9 | Lay two metal combs on top, fingers in between. A voltage makes a ripple under every finger. | Interdigital comb pair; ripples under finger gaps. | Tap: zap; ripples start. | 3.5 |
| 10 | The ripples add up only for one note: the one that fits the comb. | Comb with a wave whose crests match finger spacing; mismatched wave fades. | Slider: frequency; output peaks at the match. | 3.5 |
| 11 | That is a filter. A phone has many of them. | Phone outline with many small filter chips. | Tap chips: each lights one radio band. | 3.5 |
| 12 | Sound makes stripes of squeezed and stretched crystal. Light passing through is turned aside, and its color shifts a tiny bit. | Moving stripes; incoming beam and a weaker side beam. | Animation: stripes move; side beam appears. | 3.6 |
| 13 | In a very thin crystal, tiny sound and light can share one tiny home. | Nanostructured beam holding both a sound ripple and a light spot; microwave line at one end, fiber at the other. | Tap: microwave -> sound -> light chain lights in order. | 3.7 |
| 14 | Now you know sound in lithium niobate! | Squeeze, ripple, comb, phone together. | Tap any part: back to its page. | 3.1 |

Numbers (hover):
- p3: about 2.3 times larger along Y than along Z (d22 = 20.3 vs d33 = 8.7 pC/N) (ch03:L32).
- p4: one volt moves the faces about 20 pm along Y (ch03:L32).
- p5: 3.5 to 7.4 km/s depending on direction; 7.33 km/s for a compression wave along the polar axis (ch03:L145).
- p6-7: surface wave 3.4 to 4.0 km/s, 75,000 to 88,000 times slower than light; at 1 GHz a 4 um ripple (ch03:L199).
- p8: 128 degree rotated Y cut (ch03:L257; ch05:L151; ev:L641 h-1976-shibayama-128).
- p11: more than 50 acoustic filters (SAW and BAW) in a mid/high-tier 4G phone, 2018 count, more than 70 expected with 5G (ch03:L295; vendor contribution in trade press, grade V).
- p13: at 2 GHz the sound wavelength is about 2 um, near the 0.70 um wavelength of 1550 nm light inside the crystal (ch03:L370).

Flags:
- "Squeeze it and a spark appears" is wrong for this page: squeezing gives charge and a voltage, shown on a meter. Sparks need large voltages; the one spark in this site's L1 text is pyroelectric (ch04:L275). Keep sparks out of ch03.
- p3 "more": pressing along Y gives more charge than pressing along Z for the longitudinal coefficients (d22 vs d33); do not generalize to "sideways is always more".
- p5 "sound": these waves are far above hearing (MHz to GHz). Hover: "sound too high to hear".
- p8: 128 degrees is near the strongest coupling for the ordinary surface wave and nearly zero for the spurious fast wave; the leaky waves near 41 and 64 degrees have two to three times more coupling (ch03:L257). Never say "128 is the strongest cut".
- p11: do not say "the filters are lithium niobate". Many are SAW filters on LN or its sibling LiTaO3; LT appears to dominate SAW (E), and BAW filters use aluminum nitride (ch06:L392, ch08:L304). Hover: "many on lithium niobate or its sister crystal, lithium tantalate".
- p12: frequency shift equals the sound frequency exactly (ch03:L325), tiny relative to the light; "a tiny bit" is correct, "changes color" alone would overstate it.

---

## 04 Quirks, 14 pages

Cumulative object: a beam that leaves a mark -> the mark erased -> magnesium -> green and infrared -> warmth -> charge -> drift -> lithium leaving -> two faces.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | Lithium niobate is a wonderful crystal. It also has quirks. | The block, with small icons around it (beam, hotplate, dial). | Tap an icon: jump to its page. | 4 |
| 2 | Shine bright light through it. The light knocks loose tiny charges. | Blue-green beam; small dots popping off trap sites inside the beam. | Tap: dots pop. | 4.1 |
| 3 | The charges drift along the arrow and get stuck at the dark edges. | Dots moving along the arrow, collecting at the beam edges. | Animation: drift and pile-up. | 4.1 |
| 4 | Their electric push changes the wave speed. The beam leaves a mark behind. | Beam off; a faint track remains; a second beam passing it gets smeared. | Toggle beam off: mark stays. | 4.1 |
| 5 | Shine light everywhere, or warm it up, and the mark goes away. | Uniform glow or a hotplate; track fading. | Drag: erase by light or heat. | 4.1 |
| 6 | Add a little magnesium. Now the charges slip back before they can make a mark. | Mg balls in the lattice; dots flowing back as fast as they are freed. | Toggle MgO on/off: mark grows or does not. | 4.2 |
| 7 | Very bright green light makes the crystal soak up infrared light, and it warms up. | Overlapping green and dashed-red beams; red fades where they overlap; heat shimmer. | Slider: green power; infrared output drops. | 4.4 |
| 8 | Warm the crystal. Its lean gets a little smaller. | Block on hotplate; arrow shrinks. | Slider: temperature; arrow length. | 4.6 |
| 9 | Charge piles up on its top and bottom. Zap! A spark, or dust jumps onto it. | + and - on the faces across the arrow; small spark; dust specks drawn in. | Slider: temperature step; voltage meter climbs, then zap resets. | 4.6 |
| 10 | Heat also changes the wave speed, more for one wiggle than the other. | Two waves, one shifting more as temperature rises; a ring whose dip turns into a triangle. | Slider: temperature; crests shift. | 4.8 |
| 11 | Set a modulator with a steady voltage. Slowly, hidden charges move and undo part of it. | Modulator chip, dial needle drifting; small charges creeping. | Animation: drift; tap "re-lock" to reset. | 4.7 |
| 12 | Bake it very hot, and some lithium leaves the surface. | Wafer heating; Li balls (with O) leaving the top layer. | Slider: bake time; depleted skin thickens. | 4.9 |
| 13 | Its top and bottom are different. Etch them both, and one wears away faster. | Block with + and - faces; one face eroding faster. | Animation: side-by-side etch. | 4.10 |
| 14 | Now you know the quirks of lithium niobate! | All icons from page 1, each with its fix drawn small (magnesium, slow warming, re-lock). | Tap any part: back to its page. | 4 |

Numbers (hover):
- p4: photorefraction seen at intensities as low as 10 mW/cm^2 in LiNbO3:Fe, blue-green light, no threshold (ch04:L39).
- p6: about 5 % MgO; about a hundred times more photoconductive (ch04:L121; bryan1984).
- p9: "kilovolts across its thickness" (ch04:L275), no single number.
- p10: extraordinary index changes 5 to 11 times more with heat than ordinary (ch04:L406).

Flags:
- "Light damages the crystal" (p4): photorefraction was first called "optical damage" but is reversible (ch04:L33). Say "mark", never "burn" or "broken". Real breakdown is a separate, permanent regime (4.5), not drawn here.
- p3: the push comes from the crystal's polar structure itself, with no applied voltage (ch04:L33). Do not draw a battery on this page.
- "Magnesium blocks the light" / "stops the charges" (p6) is wrong: Mg makes the crystal about 100x more photoconductive, so the separated charge leaks back (ch04:L121). Picture shows charges flowing back, not a shield.
- p7: the infrared absorption is temporary and stops when the green stops (ch04:L246); magnesium removes the trap sites (ch04:L205).
- p9: charge appears only on the faces across the arrow (ch01:L369), and cooling gives the opposite sign. Draw signs only on top and bottom.
- p12: lithium leaves as lithium oxide (ch04:L441); text says "some lithium leaves", hover says "as lithium oxide".

Not covered: 4.3 (thin-film ring photorefraction), 4.5 (damage ladder). Optional page between 5 and 6: "In a tiny ring of light, the mark nudges the color one way, and heat nudges it the other way." (ch04:L171).

---

## 05 Making, 14 pages

Cumulative object: rock and brine -> powder -> melt -> seed -> boule -> wafer -> thin film -> ridge -> glass blanket -> gold -> stripes -> chip with fiber.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | Niobium comes from a rock dug up in Brazil. Lithium comes from salty water, and from rock too. | A rock; a pool of brine; a second rock. | Tap each: label appears. | 5.1 |
| 2 | Mix one lithium, one niobium, three oxygen. | Ball recipe: 1 Li + 1 Nb + 3 O. | Drag balls into a bowl. | 5.1 |
| 3 | Melt it in a very hot pot. | Crucible with glowing melt, heater coil. | Slider: heat; powder melts. | 5.2 |
| 4 | Dip in a tiny seed crystal. Turn it slowly. Pull it up, very, very slowly. | Seed rod touching the melt; rotation arrow; meniscus. | Drag up slowly; too fast and it detaches. | 5.2 |
| 5 | Days later, there is a big crystal. It is called a boule. | Long boule hanging over the crucible. | Tap: time-lapse grow. | 5.2 |
| 6 | Make all its arrows point one way. Slice it into thin round wafers. | Boule sliced like bread; one wafer with a flat on its edge. | Tap: slice. | 5.3 |
| 7 | Shoot tiny helium bits into a wafer. They all stop at the same depth. | Arrows entering the wafer; dotted plane just below the surface. | Slider: energy; plane depth moves. | 5.5 |
| 8 | Flip it onto silicon with a glassy top. Warm it. It splits along the line! | LN wafer face-down on oxidized silicon; split; thin film left behind. | Slider: heat; split happens. | 5.5 |
| 9 | Draw lines. Blast with argon to knock bits away. A ridge is left. | Mask stripe on the film; argon dots hitting; rib emerging. | Drag: etch time; rib deepens. | 5.7 |
| 10 | Tuck it under a glass blanket. | Silica layer covering the rib. | Tap: blanket on. | 5.8 |
| 11 | Lay gold stripes beside the ridge. | Gold electrodes either side of the rib. | Tap: resist washes off, gold stays (lift-off). | 5.9 |
| 12 | For color tricks, flip stripes with a comb and a quick zap. | Comb electrode; alternating arrow stripes under the teeth. | Tap: zap; stripes flip. | 5.10 |
| 13 | Cut out the chip. Line up a glass fiber. Light goes in! | Chip on a block; fiber aligned to a taper at the edge; light entering. | Drag the fiber into alignment; light couples when aligned. | 5.11 |
| 14 | Now you know how lithium niobate chips are made! | Row of all earlier stages as small icons. | Tap an icon: back to its page; links to the Process viewer. | 5.12 |

Numbers (hover):
- p2: niobium is 62.8 % of its mass (ch05:L48).
- p3: congruent crystal melts at 1255 C (ch01:L134; id `melting-point/cln/volk2008`).
- p4: pulled up by one or two millimetres per hour (ch05:L85).
- p5: a 150 mm (6-inch) boule takes days (ch05:L85).
- p7: about 0.7 um deep for 195 keV helium (ch05:L221).
- p13 or p14: a 150 mm wafer 0.5 mm thick holds about 26 g of niobium (ch05:L48).

Flags:
- p2 "one, one, three" is the formula; the real melt is the congruent composition, slightly short of lithium (ch05:L85). Hover on p3.
- p1: the Brazilian rock is pyrochlore ore (a niobium mineral), not lithium niobate (ch05:L48; ch01:L28).
- p8: "glassy top" = silicon dioxide on silicon (oxidized silicon, ch05:L221). Do not say "glued to glass".
- p9: argon removes material physically, not chemically (fluorine forms non-volatile LiF) (ch05:L318). "Knock bits away" is correct; "melt" or "dissolve" is not.
- p6: the boule is poled before slicing (ch05:L151). Do not imply each wafer is poled by the user.

---

## 06 Devices, 14 pages

Cumulative object: a message -> light in a crystal wire -> two paths and gold -> blinking light -> racing microwave -> then each device adds one new trick.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | This is a message: on, off, on, on. | Row of four squares, lit / dark. | Tap squares to write a message. | 6.0 |
| 2 | This is light in a thin crystal wire. | Glowing ridge waveguide on a chip. | Tap: light on. | 6.1 |
| 3 | Split it into two paths. Lay gold stripes beside them. | Mach-Zehnder with ground-signal-ground gold electrodes. | none | 6.1 |
| 4 | A voltage changes the wave speed in the paths. In step: bright. Out of step: dark. | Same chip; output lamp; small bright-dark curve. | Drag bias; lamp follows the curve. | 6.1 |
| 5 | Now the light blinks your message down a glass fiber. | The page-1 message driving the chip; blinking light entering a fiber spool. | Message from page 1 plays out as light pulses. | 6.1 |
| 6 | For fast messages, a microwave and the light race side by side. | Electrode with a microwave wave and a light pulse moving together. | Slider: microwave speed; mismatch smears the pulses. | 6.2 |
| 7 | Stripes of flipped arrows turn infrared light into light of twice the frequency. | Striped waveguide; dashed red in, shorter-wavelength light out. | Slider: pump power; output grows. | 6.4 |
| 8 | Run it backward. A strong beam splits into two new colors that laser diodes do not make. | Pump splitting into signal and idler inside a ring. | Slider: pump; oscillation starts above a threshold. | 6.5 |
| 9 | Tap a ring of light with a microwave, in time with each trip around. Out comes a comb of evenly spaced colors. | Ring; spectrum of many equally spaced lines. | Slider: drive on; lines appear one by one. | 6.6 |
| 10 | Quantum light: light that is extra calm in one way, and twin bits of light that belong together. | Two paired dots leaving a waveguide; a noise band thinned on one axis, widened on the other. | Tap: emit a pair. | 6.7 |
| 11 | Comb electrodes make sound ripples. The ripples can nudge light, or pick a phone's radio band. | Comb launching a ripple across a waveguide; branch to a phone filter. | Slider: ripple frequency; ripple spacing changes. | 6.8, 6.9 |
| 12 | Lithium niobate does not make light well on its own. So a tiny laser chip is joined on. | Small III-V chip bonded beside the LN modulator. | Tap: laser on, light flows into the modulator. | 6.10 |
| 13 | It has a sister: lithium tantalate. Same shape, with tantalum where niobium was. | Two lattices side by side; Nb ball swapped for Ta ball. | Tap: swap Nb <-> Ta. | 6.11 |
| 14 | Now you know lithium niobate devices! | The chip from p3 with small icons of p7-p13 around it. | Tap any part: back to its page. | 6.0 |

Numbers (hover):
- p3: median electrode gap 5.0 um over 144 TFLN device rows (ch06:L57, derived from the atlas).
- p6: at 100 GHz the on-chip drive wavelength is about 1.4 mm (ch06:L132, derived).
- p7: one thin-film waveguide converted more than 80 % of a 20 mW pump in a single pass (ch06:L228, reported, chen2024nn, arXiv). Do not attach this number to "green".
- p9: more than 900 lines at about 10 GHz spacing in a TFLN microring (ch02:L419, reported, zhang2019).
- p13: thin-film LT and LN modulators reach the same median voltage-length product, 2.43 vs 2.44 V cm, in the atlas sample of 233 papers (ch06:L445).

Flags:
- p4 repeats the ch02 rule: voltage changes speed (phase), interference changes brightness; never "the voltage bends or blocks the light".
- p7: say "twice the frequency". "Green" only for 1064 nm pumps; the cited 80 % device is not stated to make green.
- p8: "colors laser diodes do not make" is the chapter's claim (ch06:L262); do not extend to "colors nothing else makes".
- p10: "Light quieter than nothing / than empty space" is misleading. Squeezing lowers the noise in one property below the vacuum level while the other gets noisier (ch06:L323). The picture must show both axes.
- p11: BAW filters use aluminum nitride, not LN; LT appears to dominate SAW (ch06:L392). Text says "can pick", not "LN filters are in your phone".
- p12: "on its own" matters; erbium doping adds an amplifier and bonded III-V adds a laser (ch06:L418).

---

## 07 History, 14 pages

Cumulative object: a timeline ribbon that gains one dot per page; every dot is an events.yaml entry (id and line given). Status badges carried over (V/P/S).

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | 1801. A chemist finds a new metal in a stone. He calls it columbium. | Stone and a flask; ribbon starts with one dot. | Tap dot: hover with the record. | 7.1 |
| 2 | 1818. Another new metal: lithium. Its name means stone. | Small Li ball beside a stone; second dot. | Tap: dot. | 7.1 |
| 3 | 1844. The first metal gets a new name: niobium, after Niobe, daughter of Tantalus. In 1949, everyone agrees to call it niobium. | Nb ball; two dots (1844, 1949). | Tap: name changes columbium -> niobium. | 7.1 |
| 4 | 1949. Two scientists find the crystal's arrow, and that a push can flip it. | Crystal with an arrow that flips. | Tap: flip. | 7.1, 7.2 |
| 5 | 1964. Infrared in, green out. And a voltage changes how fast light goes through it. | Dashed red beam in, green out; battery beside a second beam. | Tap: green on. | 7.2 |
| 6 | 1965. Dip a seed in a glowing melt and pull slowly: a clear crystal grows. The trick was first written down in 1917. | Crucible and boule; dots at 1917 and 1965. | Drag up: boule grows. | 7.2 |
| 7 | 1966. A laser leaves a mark in the crystal. 1968. The mark becomes a memory: pictures written with light. | Beam track; then a stored pattern. | Tap: write, then read the picture. | 7.3 |
| 8 | 1974. Bake titanium lines into the crystal, and light follows them like wires. | Wafer with Ti stripes; light following a curve. | Tap: bake. | 7.5 |
| 9 | 1976. Cut the crystal at just the right tilt for sound ripples. About 1980, filters like these go into TVs. | Tilted cut; TV outline. | Drag: cut angle. | 7.4 |
| 10 | 1980. Stripes of flipped arrows, grown into the crystal. 1993. Stripes flipped with a voltage instead. | Striped crystal; comb electrode zap. | Tap: zap. | 7.6 |
| 11 | 1985. The first guided-light modulator anyone can buy. 2021. One company ships its millionth. | Single modulator box; then a large stack. | Tap: stack fills. | 7.7 |
| 12 | 1998. Peel a thin sheet off the crystal. 2004. Peel it thinner still, onto glass, and it still works with voltage. | Ion implant and peel; thin film on silica. | Drag: peel. | 7.8 |
| 13 | 2018. A tiny chip that needs only a computer chip's voltage. 2026. One laser feeds eight lanes of data through a thin crystal chip. | Small chip with a low-voltage source; eight parallel light lanes. | Tap: lanes light. | 7.9, 7.10 |
| 14 | Now you know the story of lithium niobate! | The full ribbon, 1801 to 2026, every dot from pages 1-13. | Tap any dot: back to its page and its grown-up event. | 7.1 |

Events used (all from `content/chapters/07-history/events.yaml`):
- p1 h-1801-hatchett-columbium (1801-11-26, ev:L33, V).
- p2 h-1818-arfwedson-lithium (1818-02-09, ev:L75, V).
- p3 h-1844-rose-niobium (1844-10-31, ev:L89, V); h-1949-iupac-niobium (1949, ev:L173, S).
- p4 h-1949-matthias-remeika (1949-12-15, ev:L159, V).
- p5 h-1964-boyd-nlo (1964-12-01, ev:L231, V); h-1964-peterson-eo (1964-08-01, ev:L217, V).
- p6 h-1965-ballman-czochralski (1965-02, ev:L245, P); h-1917-czochralski (1917-04-24, ev:L131, V). Optional hover: h-1965-fedulov, a Soviet group the same year (ev:L259, P).
- p7 h-1966-ashkin-optical-damage (1966-07-01, ev:L387, V); h-1968-chen-holography (1968-10-01, ev:L415, V). Optional hover: h-2018-ashkin-nobel (ev:L583, V), Nobel for optical tweezers, not for this crystal.
- p8 h-1974-schmidt-kaminow-ti (1974-10-15, ev:L783, V).
- p9 h-1976-shibayama-128 (1976, ev:L641, V); h-1980-tv-saw-practical (1980, approx, ev:L655, S).
- p10 h-1980-feng-qpm (1980-10-01, ev:L967, V, "standard attribution"); h-1993-yamada-field-poling (1993-02-01, ev:L1107, V).
- p11 h-1985-crystal-technology-modulator (1985, ev:L839, V); h-2021-fujitsu-millionth (2021-03-31, ev:L1487, V).
- p12 h-1998-levy-cis (1998-10-19, ev:L1517, V); h-2004-rabiei-gunter (2004-11-15, ev:L1531, V).
- p13 h-2018-wang-nature (2018-10, ev:L1701, V); h-2026-ofc-1p6t (2026-03-17, ev:L2235, V; vendor/reference-design claim).

Flags:
- p1: Hatchett found the metal in a mineral; "stone" is a fair baby word. He did not find lithium niobate (made by people; ch01:L28).
- p3: 1949 naming is S (secondary only); show the S badge.
- p4: 1949 is ferroelectricity found in LiNbO3 (and LiTaO3), not the first synthesis; the first structural listing is 1928 (ev:L145, P). Do not say "1949: lithium niobate is invented".
- p6: Ballman 1965 is P; the 1917 paper was a way to measure metal crystallization speed (ev:L131), not crystal growth for optics. Text says "the trick was first written down", which is true.
- p9: "about 1980" because date_precision is approx and status S.
- p10: 1980 first QPM in LN is marked "standard attribution" in the title; keep the hover note.
- p11: "first ... anyone can buy" restates "first commercially available guided-wave modulator" (ev:L839). Fujitsu's million is one company's count, coherent modulators only.
- p13: 2026 is a reference transceiver shown at OFC, not a product in deployment; say "shown", hover "reference design".
- Repo note (not a page): events.yaml has 162 `- id:` entries, `data/events/history.yaml` has 170, and `src/lib/content/site.ts` door text says "159 events". Worth reconciling separately.

---

## 08 Industry, 14 pages

Cumulative object: a rock -> a wafer -> a chain -> things to point at.

| p | Read-aloud | Picture | Interaction | Sec |
|---|---|---|---|---|
| 1 | This rock comes from Brazil. It holds niobium. Most niobium goes into steel. | Rock; steel beam beside it. | Tap rock: Nb balls glint. | 8.1 |
| 2 | A little niobium goes into lithium niobate. One big wafer holds about 26 grams of it. | Wafer beside a small pile of Nb. | Tap: the pile slides into the wafer. | 8.1 |
| 3 | Rock, powder, crystal, wafer, thin film, chip, module. One step after another. | Chain of icons left to right. | Tap each icon: one-line hover. | 8.1 |
| 4 | Many companies in many countries do these steps. | Simple world strip with region markers (US, Europe, China, Japan, Taiwan). | Tap region: count of named companies on 8.2. | 8.2 |
| 5 | Bigger wafers make more chips at once. | Circles to scale: 3, 4, 6, 8 inch. | Drag: wafer size; chip tiles fill it. | 8.3 |
| 6 | Point at a phone. Inside are tiny filters that pick its radio. | Phone outline with filter chips. | Tap: chips light. | 8.7 |
| 7 | Point at the internet. Data rides on light in glass fibers. Some of that light is written by lithium niobate. | Fiber spool; blinking light; modulator chip. | Tap: light blinks. | 8.7 |
| 8 | Point at a big data center. Thin crystal chips help move its data. | Row of racks; light lanes between them. | Tap: lanes light. | 8.5, 8.7 |
| 9 | Point at an airplane. A light gyroscope helps it know which way it turns. | Plane; coiled fiber loop with a small LN chip. | Drag: rotate the plane; the loop signal changes. | 8.7 |
| 10 | Point at a tiny projector. A striped crystal turns infrared light into green. | Pico projector; striped crystal; dashed red in, green out. | Tap: green on. | 8.7 |
| 11 | Point at a quantum computer. Some use lithium niobate chips. | Rack with a photonic chip inside. | Tap: paired dots leave a chip. | 8.7 |
| 12 | Point at a big lab laser. A crystal switch lets its pulses out, on and off. | Laser with a Pockels cell; pulses exiting. | Tap: pulse train. | 8.7 |
| 13 | How big is the business? Grown-ups guess. Their guesses are very different. | Several bars of very different lengths, each with a "guess" tag. | Tap a bar: its grade (LG). | 8.6 |
| 14 | Now you know the lithium niobate industry! | Loop: rock -> wafer -> phone, fiber, plane, projector. | Tap any object: back to its page. | 8.0 |

Numbers (hover):
- p2: a 6-inch wafer holds about 26 g of niobium (ch08:L38, ch05:L48; calculated, grade E). No everyday-object comparison: none is sourced in the repo.
- p6: more than 50 acoustic filters in a mid/high-tier 4G phone, 2018 count (ch08:L304; grades F/T/E).
- p8: OFC 2026: thin-film LN and LT were the modulator platform in 4 of the 24 postdeadline papers (ch08:L210).
- p9: Exail states over 25,000 FOGs sold (ch08:L307; vendor figure, V).
- p10: Corning lasers for MicroVision pico-projectors, 2010 (ch08:L308, T).
- p13: forecasts differ by a factor of 6.5 in base-year value and 12 in forecast value (ch08:L251; LG).

Flags:
- p1-2: the Brazilian rock is a niobium ore, not lithium niobate (ch01:L28).
- p4: claim is only that since 2023 companies and institutes in China, the US, Europe and Taiwan announced thin-film production or pilot lines, and that one supplier is named in 50 of 56 papers (ch08:L83). Do not rank countries.
- p5: 6- and 8-inch lines were announced 2023-2026 (ch08:L132); 12-inch is LG only (ch08:L134). Draw no 12-inch circle on the baby page.
- p6: say "tiny filters"; many sit on LN or LT, most SAW likely LT (E), BAW on aluminum nitride (ch08:L304). Do not say "your phone has lithium niobate".
- p7: "some of that light"; silicon photonics and InP compete and TFLN share is not public (ch08:L306).
- p10: cheap green laser pointers are not claimed to use LN (ch08:L308). Draw a projector, never a pointer.
- p11: "some"; PsiQuantum uses barium titanate, not LN (ch08:L309). Xanadu Aurora used TFLN chips (T).
- p13: never show a single market number (ch08:L251).

---

## (1) Five hardest concepts to make baby-level without lying

1. Refractive index ("light slows down"). Approach: talk only about the wave: crests bunch up and march slower inside (phase velocity c/n). Never a mechanism story (tired light, bumping, absorb-and-re-emit). Two speeds only for light crossing the arrow; along it, one speed.
2. Pockels effect ("electricity bends light"). Approach: the voltage changes the wave's speed a tiny bit, which shifts its timing; brightness changes only when two paths rejoin (crests on crests vs crests on dips). Never draw a bent beam; "dark here", not "light gone".
3. Second-harmonic generation and quasi-phase-matching ("the crystal makes new colors"). Approach: light comes in bits; two infrared bits join into one bit with both their energies. Without stripes the new light slips out of step and turns back; flipped stripes keep each push in step. Use 1064 -> 532 nm for "green"; say "twice the frequency" elsewhere.
4. The built-in polarization (the arrow). Approach: "everything leans the same way", caused by Li and Nb both scooting relative to oxygen on cooling; electric, not magnetic; it shows up as surface charge only when it changes (squeeze, warm), which is why pyro and piezo pages show charge on change, not at rest.
5. Photorefraction and the MgO cure ("light damages it / magnesium blocks light"). Approach: light frees charges, they drift and pile up, their field changes wave speed: a reversible "mark". Magnesium makes the crystal ~100x more photoconductive, so charges slip back before a mark forms. Picture shows charges flowing back, not a shield.

Runner-up flags handled in the books: piezo "spark" (ch03), squeezed light "quieter than nothing" (ch06), "LN is a rock" (ch01, ch05, ch08), "phone filters are LN" (ch03, ch06, ch08).

## (2) Recurring object

Recommendation: the arrow (the crystal's built-in lean, the polar c axis), drawn identically on every crystal in every book. It emerges naturally and carries real physics across chapters:
- 01: it appears on cooling, flips with voltage, forms stripes.
- 02: two speeds depend on wiggle along vs across it; stripes of flipped arrows keep green growing.
- 03: squeezing charges the faces only because the crystal lacks a center of symmetry, which the arrow represents.
- 04: charges drift along it (photorefraction); warmth shrinks it (pyro); top and bottom etch differently.
- 05-06: the boule is poled so all arrows agree; periodic poling flips stripes of it.
- 07: 1949 page is "the arrow is found" (ev:L159 hook literally says "built-in electric arrow that a field can flip").

Secondary cameo (optional): a small Li ball in 01 p9 (missing lithium), 04 p12 (lithium leaving), 05 p1 (lithium from brine), 07 p2 (named for stone). Argue against making it the protagonist: the arrow comes from Li and Nb together, so a Li hero would push the false "lithium makes the arrow" story. Argue against a photon mascot: it appears only in 02/06, and a photon with a body invites the wrong "photon slows down / bumps into atoms" picture.
