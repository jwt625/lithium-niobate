<!-- F7.1 Family tree of names (figures.md): Tantalus, Niobe, Pelops; Ta, Nb, pelopium, columbium; lithos, Li; LiNbO3,
     LiTaO3. Selecting a node shows the coining sentence (original, then an English gloss), author, year, locator and
     sources. TECH: ASCII tree. VISUAL: engraved-line tree with 3m trefoil nodes. Quotes as given in the manuscript. -->
<script lang="ts">
  import { lab } from "../labels";
  import { HSTATUS, type HStatus } from "../status";

  interface Node { id: string; label: string; orig?: string; gloss?: string; text: string; who: string; when: string; loc: string; cites: [string, HStatus][] }
  const N: Record<string, Node> = {
    tantalus: { id: "tantalus", label: "Tantalus", text: "Tantalus of Greek myth stood in water he could never drink. Ekeberg named tantalum after him: the oxide would not dissolve even in excess acid.", who: "A. G. Ekeberg", when: "1802", loc: "via Rose 1844, p. 318", cites: [["ekeberg1802", "P"], ["rose1844", "V"]] },
    niobe: { id: "niobe", label: "Niobe", orig: "Ich nenne dasselbe Niobium und sein Oxyd Niobsaure, von Niobe, der Tochter des Tantalus, um durch den Namen die Aehnlichkeit ... anzudeuten", gloss: "I name it niobium and its oxide niobic acid, after Niobe, the daughter of Tantalus, to indicate by the name the similarity ...", text: "Rose showed that tantalite from Bavaria held a second metal.", who: "Heinrich Rose", when: "1844 (read to the Berlin Academy 1844-10-31)", loc: "Ann. Phys. 139, pp. 335-336", cites: [["rose1844", "V"], ["rose1844bericht", "V"]] },
    pelops: { id: "pelops", label: "Pelops", orig: "von Pelops, dem Sohne des Tantalus, und dem Bruder der Niobe", gloss: "after Pelops, the son of Tantalus and the brother of Niobe", text: "Rose named a third metal, pelopium. It was niobium again; Marignac (1866) traced the errors to the constant association of Nb with Ta.", who: "Heinrich Rose", when: "1846 (read 1846-07-16)", loc: "Ann. Phys. 145, p. 119", cites: [["rose1846", "V"], ["rose1846bericht", "V"], ["marignac1866", "V"]] },
    pelopium: { id: "pelopium", label: "pelopium", orig: "von Pelops, dem Sohne des Tantalus, und dem Bruder der Niobe", gloss: "after Pelops, the son of Tantalus and the brother of Niobe", text: "Rose later recognized that his pelopic and niobic acids held the same metal.", who: "Heinrich Rose", when: "1846", loc: "Ann. Phys. 145, p. 119", cites: [["rose1846", "V"], ["marignac1866", "V"]] },
    ta: { id: "ta", label: "Ta", text: "Tantalum. In 1809 Wollaston argued that columbium and tantalum were the same element; chemists accepted that for 35 years.", who: "A. G. Ekeberg; W. H. Wollaston", when: "1802; 1809", loc: "via Rose 1844, p. 318", cites: [["ekeberg1802", "P"], ["wollaston1809", "V"]] },
    nb: { id: "nb", label: "Nb", text: "Niobium. The name was chosen internationally in 1949 and accepted by IUPAC in 1950; columbium persisted in US metallurgy.", who: "Heinrich Rose", when: "1844", loc: "Ann. Phys. 139, pp. 335-336", cites: [["rose1844", "V"], ["raynercanham2008", "S"], ["vanderkrogt-nb", "S"]] },
    columbium: { id: "columbium", label: "Columbium", orig: "I have been induced to give it the name of Columbium.", text: "Hatchett found an unknown metal in a mineral from North America. The element is niobium.", who: "Charles Hatchett", when: "1801 (read 1801-11-26), printed 1802", loc: "Phil. Trans. 92, p. 65", cites: [["hatchett1802", "V"]] },
    lithos: { id: "lithos", label: "lithos", text: "Greek for stone. Berzelius proposed \"Lithion\" because the alkali was first found in the mineral kingdom; the petalite came from the Uto iron mine.", who: "J. A. Arfwedson; J. J. Berzelius", when: "1818 (letter dated 1818-02-09)", loc: "Afhandlingar 6, p. 153", cites: [["arfwedson1818", "V"], ["berzelius1818", "V"]] },
    li: { id: "li", label: "Li", text: "Lithium, found by Arfwedson in petalite in Berzelius's laboratory; the discovery is commonly dated 1817.", who: "J. A. Arfwedson", when: "1818", loc: "Afhandlingar 6, p. 153", cites: [["arfwedson1818", "V"], ["weeks1932", "P"]] },
    linbo3: { id: "linbo3", label: "LiNbO3", orig: "LiCbO3", text: "By name, stone and Niobe. Earliest report found: Zachariasen's 1928 Oslo thesis. Matthias and Remeika wrote that Zachariasen had described it (as \"LiCbO3\") as belonging to the ilmenite structure, \"which is centro-symmetric\".", who: "W. H. Zachariasen; B. T. Matthias, J. P. Remeika", when: "1928; 1949", loc: "Phys. Rev. 76, 1886", cites: [["zachariasen1928", "P"], ["matthias1949", "V"]] },
    litao3: { id: "litao3", label: "LiTaO3", text: "By name, stone and Tantalus. Matthias and Remeika reported single crystals of LiNbO3 and LiTaO3 ferroelectric in 1949.", who: "B. T. Matthias, J. P. Remeika", when: "1949", loc: "Phys. Rev. 76, 1886", cites: [["matthias1949", "V"]] },
  };
  let sel = $state("niobe");
  const cur = $derived(N[sel]);
  const sub = (s: string): string => s.replace(/O3$/, "O<sub>3</sub>").replace(/Cb O3/, "CbO<sub>3</sub>");
  const cites = (c: [string, HStatus][]): string => c.map(([id, st]) => `<span class="hx-ref" data-pop="src:${id}">${lab(id)}</span>&nbsp;<span class="b ${HSTATUS[st].cls}" data-pop="hst:${st}">${HSTATUS[st].text}</span>`).join("; ");

  // ASCII tree: strings and node ids ({id})
  const TREE: (string | { n: string })[][] = [
    [{ n: "tantalus" }],
    ["  +-- ", { n: "niobe" }, " ------ ", { n: "nb" }, "   niobium, Rose 1844"],
    ["  |                  =  ", { n: "columbium" }, "   Hatchett 1801"],
    ["  +-- ", { n: "pelops" }, " ----- ", { n: "pelopium" }, "   Rose 1846 (= Nb)"],
    ["  +-- ", { n: "ta" }, "   tantalum, Ekeberg 1802"],
    [{ n: "lithos" }, " ---- ", { n: "li" }, "   lithium, Arfwedson 1818"],
    [""],
    ["Li + Nb ---- ", { n: "linbo3" }, "    stone and Niobe"],
    ["Li + Ta ---- ", { n: "litao3" }, "    stone and Tantalus"],
  ];
  // VISUAL layout (viewBox 640 x 420)
  const P: Record<string, [number, number]> = { tantalus: [330, 40], niobe: [170, 130], pelops: [330, 130], ta: [580, 130], nb: [170, 220], columbium: [50, 220], pelopium: [330, 220], lithos: [450, 200], li: [450, 290], linbo3: [250, 372], litao3: [560, 372] };
  const E: [string, string, string?][] = [["tantalus", "niobe"], ["tantalus", "pelops"], ["tantalus", "ta"], ["niobe", "nb"], ["pelops", "pelopium"], ["lithos", "li"], ["li", "linbo3"], ["nb", "linbo3"], ["li", "litao3"], ["ta", "litao3"], ["columbium", "nb", "eq"], ["pelopium", "nb", "eq"]];
  const NOTE: Record<string, string> = { nb: "niobium, Rose 1844", columbium: "Hatchett 1801", pelopium: "Rose 1846 (= Nb)", ta: "tantalum, Ekeberg 1802", li: "lithium, Arfwedson 1818", lithos: "Greek: stone", linbo3: "stone and Niobe", litao3: "stone and Tantalus" };
  const trefoil = (x: number, y: number): string => `M${x} ${y - 13}V${y + 13}M${x - 11.26} ${y + 6.5}L${x + 11.26} ${y - 6.5}M${x - 11.26} ${y - 6.5}L${x + 11.26} ${y + 6.5}`;
</script>

<div data-variant="tech" class="panel hx-ft">
  <div class="ph"><span>Names: myth, element, compound</span><span>select a name</span></div>
  <div class="hx-ft-g">
    <pre class="hx-ft-tree">{#each TREE as line, i (i)}{#each line as seg, j (j)}{#if typeof seg === "string"}{seg}{:else}<button type="button" class:on={sel === seg.n} aria-pressed={sel === seg.n} onclick={() => (sel = seg.n)}>{@html sub(N[seg.n].label)}</button>{/if}{/each}
{/each}</pre>
    <div class="hx-ft-p" aria-live="polite">
      <div class="hx-ft-h">{@html sub(cur.label)} <span class="dim">{cur.who}, {cur.when}</span></div>
      {#if cur.orig}<p class="hx-ft-q">&ldquo;{cur.orig}&rdquo;</p>{/if}
      {#if cur.gloss}<p class="hx-ft-gl">Gloss: {cur.gloss}</p>{/if}
      <p>{@html cur.text.replace(/LiNbO3/g, "LiNbO<sub>3</sub>").replace(/LiTaO3/g, "LiTaO<sub>3</sub>").replace(/"([^"]+)"/g, "&ldquo;$1&rdquo;")}</p>
      <p class="dim">{cur.loc} &middot; {@html cites(cur.cites)}</p>
    </div>
  </div>
</div>

<div data-variant="visual" class="hx-vft">
  <svg class="hx-vft-svg" viewBox="0 0 640 446" role="group" aria-label="Family tree of the names">
    {#each E as [a, b, k] (a + b)}
      {#if k === "eq"}{@const sg = Math.sign(P[b][0] - P[a][0])}
        <path class="hx-vft-e eq" d="M{P[a][0] + 17 * sg} {P[a][1]} H{P[b][0] - 17 * sg}"/>
      {:else}
        <path class="hx-vft-e" d="M{P[a][0]} {P[a][1] + 16} C {P[a][0]} {(P[a][1] + P[b][1]) / 2} {P[b][0]} {(P[a][1] + P[b][1]) / 2} {P[b][0]} {P[b][1] - 16}"/>
      {/if}
    {/each}
    {#each Object.values(N) as n (n.id)}
      {@const [x, y] = P[n.id]}
      <g class="hx-vft-n" class:on={sel === n.id} tabindex="0" role="button" aria-pressed={sel === n.id} aria-label={n.label}
        onclick={() => (sel = n.id)} onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sel = n.id; } }}>
        <circle cx={x} cy={y} r="15"/><path d={trefoil(x, y)}/><rect x={x - 46} y={y - 18} width="92" height="62" fill="transparent"/>
        <text x={x} y={y + 36} text-anchor="middle">{n.label.replace(/O3$/, "O₃")}</text>{#if NOTE[n.id]}<text class="nt" x={x} y={y + 54} text-anchor="middle">{NOTE[n.id]}</text>{/if}
      </g>
    {/each}
  </svg>
  <div class="hx-vft-p" aria-live="polite">
    <div class="hx-vft-l">{@html sub(cur.label)}</div>
    <div class="hx-vft-w">{cur.who} &middot; {cur.when}</div>
    {#if cur.orig}<p class="hx-vft-q">&ldquo;{cur.orig}&rdquo;</p>{/if}
    {#if cur.gloss}<p class="hx-vft-gl">{cur.gloss}</p>{/if}
    <p class="hx-vft-t">{@html cur.text.replace(/LiNbO3/g, "LiNbO<sub>3</sub>").replace(/LiTaO3/g, "LiTaO<sub>3</sub>").replace(/"([^"]+)"/g, "&ldquo;$1&rdquo;")}</p>
    <p class="hx-vft-s">{cur.loc} &middot; {@html cites(cur.cites)}</p>
  </div>
</div>
