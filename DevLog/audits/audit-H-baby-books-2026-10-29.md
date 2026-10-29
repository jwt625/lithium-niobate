# Audit H: BABY books (36 pages), 2026-10-29

Fresh-context subagent, read-only. Scope: read-aloud text and picture physics, every parent-note number against its cited line, `sec` hrefs, rendered lettering vs `text`, visible composition defects. Inputs: `src/lib/babies/books/**`, cited manuscript / events.yaml lines, a contact sheet of all 36 pages captured from the dev site.

Result: 0 high, 3 medium, 9 low. No false physics in any text or picture; all `sec` hrefs exist and fit; every checked number matches its cited line; rendered lettering matches `text` word for word (case aside) on all 36 pages.

| Sev | Page | Finding | Fix |
|---|---|---|---|
| medium | cover p1 | note cites "ch01, weis1985 p. 192" without lines | cite ch01:L30, ch01:L36 |
| medium | cover p2 | note cites ch01 / ch05 without lines | cite ch01:L28, ch05:L85 |
| medium | cover p3 | 71 uC/cm^2 cited to a table, value is at ch01:L140 | cite ch01:L140 |
| low | light p1 | "about 2.2 times slower" uncited | mark as derived from ch02:L17 |
| low | sound p2 | delta = wavelength/2.6 reads as sourced | mark as drawing choice consistent with ch03:L199 |
| low | quirks p4 | "single-RC display model (ch04:L344)" imprecise | one-time-constant Maxwell-Wagner response (ch04:L344-L346) |
| low | history p2 | "big crystals" not supported by ev:L245 | "pulls a crystal out of a hot melt" |
| low | history p3 | ship + undersea cable implies a 1985 undersea deployment (ev:L839 does not say) | on-land cable |
| low | history p3 | "." glyph advance too small ("SALE.IT") | wider period advance |
| low | sound p1 | bottom-face minus signs read as texture | make them as visible as the top "+" row |
| low | light p3 | output lamp pale cyan, not green | use the line's green |
| low | light p1-p3 | lead dividers split phrases; comma touches a divider on p1 | dividers between phrases, clearance from glyphs |

Fixes dispatched 2026-10-29 to the owning book lanes (cover, light, sound, quirks, history).
