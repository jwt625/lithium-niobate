<!-- F6.01 Device map: 11 families x 6 effects (manuscript 6.0 L2). TECH: boxed table, mono cells, maturity SKU tag, row
     links to sections; hovering an effect column outlines every family that uses it. VISUAL: 11 cards with line drawings,
     effect chips that light the cards, maturity as fill pattern. Highlight changes outlines only (no box change). -->
<script lang="ts">
  import { onMount } from "svelte";
  import { DEV_SECTIONS, secHref } from "./nav";

  type Eff = "po" | "c2" | "c3" | "pz" | "ao" | "he";
  type Mat = "commercial" | "research";
  interface Fam { name: string; eff: Eff[]; mat: Mat; mtext: string; pop?: string; sec: string; art: "mzi" | "mzib" | "poled" | "ring" | "ringe" | "idt" | "stack" | "trans" }
  const EFF: [Eff, string, string][] = [["po", "Pockels", "Pockels"], ["c2", "χ(2)", "χ(2)"], ["c3", "χ(3)", "χ(3)"], ["pz", "piezo", "piezoelectric"], ["ao", "AO", "acousto-optic"], ["he", "hetero", "heterogeneous gain / absorption"]];
  const FAM: Fam[] = [
    { name: "Bulk Ti-indiffused / proton-exchanged LN modulators", eff: ["po"], mat: "commercial", mtext: "Exail: LN modulators since 2000", pop: "s:37", sec: "6.1", art: "mzib" },
    { name: "TFLN MZM and IQ modulators", eff: ["po"], mat: "commercial", mtext: "AFR volume shipment, 2025-04-07", pop: "s:31", sec: "6.1", art: "mzi" },
    { name: "PPLN frequency converters (bulk, waveguide)", eff: ["c2"], mat: "commercial", mtext: "bulk MgO:PPLN (Covesion, 2025-06-05); TFLN research", pop: "s:41", sec: "6.4", art: "poled" },
    { name: "OPA / OPO on TFLN", eff: ["c2"], mat: "research", mtext: "research", sec: "6.5", art: "ring" },
    { name: "EO and Kerr combs, EO frequency shifters", eff: ["po", "c3"], mat: "research", mtext: "research", sec: "6.6", art: "ringe" },
    { name: "Squeezers, pair sources, quantum frequency converters", eff: ["c2"], mat: "research", mtext: "research", sec: "6.7", art: "poled" },
    { name: "Microwave-optical transducers", eff: ["po", "pz", "ao"], mat: "research", mtext: "mK and room temperature", sec: "6.7", art: "trans" },
    { name: "Acousto-optic modulators and frequency shifters", eff: ["pz", "ao"], mat: "research", mtext: "research", sec: "6.8", art: "idt" },
    { name: "RF acoustic filters (SAW, POI, XBAR)", eff: ["pz"], mat: "commercial", mtext: "high volume; LT dominant for SAW (inference)", pop: "s:3", sec: "6.9", art: "idt" },
    { name: "Heterogeneous lasers, amplifiers, detectors on TFLN", eff: ["he"], mat: "research", mtext: "research", sec: "6.10", art: "stack" },
    { name: "Thin-film lithium tantalate (TFLT) devices", eff: ["po", "c2"], mat: "research", mtext: "earliest TFLT modulator paper in the eo-modulator-atlas sample: 2024", sec: "6.11", art: "mzi" },
  ];
  const href = (no: string): string => secHref(DEV_SECTIONS.find((s) => s.no === no) ?? DEV_SECTIONS[0]);
  const ART: Record<Fam["art"], string> = {
    mzi: `<path class="wg" d="M4 30H24C34 30 36 16 46 16H94C104 16 106 30 116 30H136M24 30C34 30 36 44 46 44H94C104 44 106 30 116 30"/><path class="au" d="M46 9h48v4h-48zM46 27h48v6h-48zM46 47h48v4h-48z"/><path class="ir" d="M4 30H20"/>`,
    mzib: `<path class="wg" d="M4 30H24C34 30 36 16 46 16H94C104 16 106 30 116 30H136M24 30C34 30 36 44 46 44H94C104 44 106 30 116 30" style="stroke-width:3.5"/><path class="au" d="M46 22h48v3h-48zM46 35h48v3h-48z"/>`,
    poled: `${Array.from({ length: 12 }, (_, i) => (i % 2 ? "" : `<rect class="dom" x="${10 + i * 10}" y="18" width="10" height="24"/>`)).join("")}<rect class="dim" x="10" y="18" width="120" height="24" fill="none"/><path class="ir" d="M4 30H60"/>`,
    ring: `<circle class="wg" cx="70" cy="24" r="17"/><path class="wg" d="M4 47H136"/><path class="ir" d="M4 47H40"/>`,
    ringe: `<circle class="wg" cx="70" cy="26" r="16"/><circle class="au" cx="70" cy="26" r="9" opacity="0.8"/><path class="wg" d="M4 48H136"/><path class="ir" d="M84 48H136"/>`,
    idt: `<path class="au" d="M8 8h50v4h-50zM8 48h50v4h-50z"/>${Array.from({ length: 8 }, (_, i) => `<rect class="au" x="${11 + i * 6}" y="${i % 2 ? 16 : 12}" width="2.5" height="32"/>`).join("")}${[70, 82, 94, 106].map((x) => `<path class="rip" d="M${x} 10V50"/>`).join("")}<path class="ir" d="M120 4V56"/>`,
    stack: `<rect class="si" x="20" y="42" width="100" height="12"/><rect class="ox" x="20" y="34" width="100" height="8"/><rect class="ln" x="20" y="28" width="100" height="6"/><rect class="au" x="50" y="12" width="40" height="14" opacity="0.6"/><text x="70" y="22" text-anchor="middle" style="font-size:8px">III-V</text>`,
    trans: `<circle class="wg" cx="44" cy="30" r="15"/><path class="au" d="M86 14h40v32h-40z" opacity="0.5"/><path class="fl" d="M60 30H86"/><text x="106" y="34" text-anchor="middle" style="font-size:8px">μW</text>`,
  };
  let host: HTMLElement;
  onMount(() => {
    const light = (e: string | null): void => {
      host.querySelectorAll<HTMLElement>("[data-eff]").forEach((el) => el.classList.toggle("lit", !!e && (el.dataset.eff ?? "").split(" ").includes(e)));
      host.querySelectorAll<HTMLElement>("[data-col]").forEach((el) => el.classList.toggle("on", el.dataset.col === e));
      host.querySelectorAll<HTMLElement>(".v-fam").forEach((el) => el.classList.toggle("dim", !!e && !(el.dataset.eff ?? "").split(" ").includes(e)));
      const n = e ? FAM.filter((f) => f.eff.includes(e as Eff)).length : null;
      host.querySelectorAll<HTMLElement>("[data-o='lit']").forEach((el) => { el.textContent = n == null ? "hover an effect" : `${n} of ${FAM.length} families use ${EFF.find((x) => x[0] === e)?.[2]}`; });
    };
    let pinned: string | null = null;
    const over = (ev: Event): void => { const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-col]"); if (t) light(t.dataset.col ?? null); };
    const out = (ev: Event): void => { if ((ev.target as HTMLElement).closest("[data-col]")) light(pinned); };
    const click = (ev: Event): void => { const t = (ev.target as HTMLElement).closest<HTMLElement>("[data-col]"); if (t) { pinned = pinned === t.dataset.col ? null : (t.dataset.col ?? null); light(pinned); } };
    host.addEventListener("pointerover", over); host.addEventListener("pointerout", out); host.addEventListener("focusin", over); host.addEventListener("focusout", out); host.addEventListener("click", click);
    return () => { host.removeEventListener("pointerover", over); host.removeEventListener("pointerout", out); host.removeEventListener("focusin", over); host.removeEventListener("focusout", out); host.removeEventListener("click", click); };
  });
</script>

<div bind:this={host}>
  <div class="panel dvf" data-variant="tech">
    <div class="ph"><span>Device map: family × physical effect</span><span class="dim" data-o="lit" style="display:inline-block;width:50ch;max-width:100%;text-align:right;white-space:nowrap;overflow:hidden">hover an effect</span></div>
    <div class="scrollx">
      <table class="idx dv-map">
        <thead><tr><th>Family</th>{#each EFF as [k, l, t] (k)}<th class="c"><button type="button" class="colb" data-col={k} title={t}>{l}</button></th>{/each}<th>Maturity (dated evidence)</th><th>Sec.</th></tr></thead>
        <tbody>
          {#each FAM as f (f.name)}
            <tr class="go"><td class="h" style="white-space:normal"><a href={href(f.sec)}>{f.name}</a></td>{#each EFF as [k] (k)}<td class="c{f.eff.includes(k) ? '' : ' e'}" data-eff={f.eff.includes(k) ? k : ""}>{f.eff.includes(k) ? "■" : "·"}</td>{/each}<td class="mt">{#if f.pop}<button type="button" class="tag tagb{f.mat === 'commercial' ? ' solid' : ''}" data-pop={f.pop}>{f.mat}</button>{:else}<span class="tag">{f.mat}</span>{/if} {#if f.mtext !== "research"}<span class="dim">{f.mtext}</span>{/if}</td><td>{f.sec}</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
    <div class="pf"><span style="white-space:normal">Filled square: the family uses the effect. Maturity "commercial" only with a dated company statement (popup on the tag); otherwise research. Click a column header to hold the highlight.</span></div>
  </div>
  <div class="dvv" data-variant="visual">
    <div class="v-chips" role="group" aria-label="Effects">{#each EFF as [k, , t] (k)}<button type="button" data-col={k}>{t}</button>{/each}</div>
    <p class="v-cap" data-o="lit" style="margin:10px 0 18px; height:44px; overflow:hidden">hover an effect</p>
    <div class="v-fams">
      {#each FAM as f (f.name)}
        <a class="v-fam" href={href(f.sec)} data-eff={f.eff.join(" ")}>
          <svg class="dv-art visual" viewBox="0 0 140 60" aria-hidden="true">{@html ART[f.art]}</svg>
          <span class="v-fam-n">{f.name}</span>
          <span class="v-fam-e">{f.eff.map((e) => EFF.find((x) => x[0] === e)?.[1]).join(" · ")}</span>
          <span class="v-fam-m"><i class="mat {f.mat}"></i>{f.mtext === "research" ? "research" : `${f.mat}: ${f.mtext}`}</span>
          <span class="v-fam-s">{f.sec}</span>
        </a>
      {/each}
    </div>
  </div>
</div>

<style>
  :global(:root[data-mode="visual"]) .v-fams { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  @media (max-width: 760px) { :global(:root[data-mode="visual"]) .v-fams { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 430px) { :global(:root[data-mode="visual"]) .v-fams { grid-template-columns: minmax(0, 1fr); } }
  :global(:root[data-mode="visual"]) .v-fam { position: relative; display: flex; flex-direction: column; gap: 8px; padding: 16px 18px; min-height: 230px; background: var(--v-ink1); border: 1px solid var(--v-line); outline: 2px solid transparent; outline-offset: -2px; clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 31px, 100% 100%, 0 100%); color: var(--v-text); transition: opacity 120ms var(--v-ease), outline-color 120ms var(--v-ease); }
  :global(:root[data-mode="visual"]) .v-fam svg { height: 64px; width: 100%; }
  :global(:root[data-mode="visual"]) .v-fam.lit { outline-color: var(--v-l532); }
  :global(:root[data-mode="visual"]) .v-fam.dim { opacity: 0.35; }
  :global(:root[data-mode="visual"]) .v-fam:focus-visible { outline: 3px solid var(--v-l532); }
  .v-fam-n { font: 400 19px/25px var(--v-serif); }
  .v-fam-e { font: 500 13px/18px var(--v-ui); color: var(--v-text3); }
  .v-fam-m { font: 400 13px/18px var(--v-ui); color: var(--v-text2); margin-top: auto; }
  .v-fam-s { position: absolute; right: 26px; top: 14px; font: 500 13px var(--v-ui); color: var(--v-text3); }
  .mat { display: inline-block; width: 10px; height: 10px; transform: rotate(45deg); margin: 0 8px 1px 2px; border: 1.5px solid var(--v-text2); }
  .mat.commercial { background: var(--v-text2); }
</style>
