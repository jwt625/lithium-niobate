<!-- Optic-axis spine (port of mockup app.js "spine" + visual.js spine()): one octahedron per visible [data-spine] section,
     cycling Li, Nb, empty as the octahedral columns repeat along +c; the cursor marks the scroll position along c.
     TECH: flat diamonds in the desk gutter (>= 1260 px). VISUAL: shaded octahedra in the 72 px axis gutter (>= 1100 px). -->
<script lang="ts">
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { onUi } from "$lib/figures/dom";

  type Kind = "Li" | "Nb" | "vac";
  const SEQ: Kind[] = ["Li", "Nb", "vac"];
  const NAME: Record<Kind, string> = { Li: "Li octahedron", Nb: "Nb octahedron", vac: "empty octahedron" };
  const flat = (f: string, s: string, dash: boolean): string =>
    `<svg viewBox="0 0 13 13" aria-hidden="true"><path d="M6.5 0.7L12.3 6.5 6.5 12.3 0.7 6.5Z" fill="${f}" stroke="${s}" stroke-width="1"${dash ? ' stroke-dasharray="1.4 1.2"' : ""}/></svg>`;
  const TECH: Record<Kind, string> = { Li: flat("var(--fg3)", "var(--bg0)", false), Nb: flat("var(--fg2)", "var(--bg0)", false), vac: flat("var(--bg0)", "var(--fg3)", true) };
  const octa = (kind: Kind): string => {
    const c = kind === "Li" ? "var(--v-au)" : kind === "Nb" ? "var(--nb)" : "none";
    const st = kind === "vac" ? 'stroke="var(--v-text3)" stroke-dasharray="2 1.5"' : 'stroke="var(--v-ink0)"';
    const F = (d: string, o: number): string => `<path d="M${d}Z" fill="${c}" fill-opacity="${kind === "vac" ? 0 : o}" ${st} stroke-width="0.9"/>`;
    return `<svg viewBox="0 0 22 22" aria-hidden="true">${F("11 1L2 11L11 13.5", 1)}${F("11 1L20 11L11 13.5", 0.72)}${F("2 11L11 21L11 13.5", 0.5)}${F("20 11L11 21L11 13.5", 0.32)}</svg>`;
  };

  let spine: HTMLDivElement;
  let cur: HTMLDivElement;
  let secs: HTMLElement[] = [];
  let marks: HTMLAnchorElement[] = [];

  function build(): void {
    marks.forEach((m) => m.remove());
    const visual = document.documentElement.dataset.mode === "visual";
    secs = [...document.querySelectorAll<HTMLElement>("[data-spine]")].filter((s) => s.offsetParent !== null);
    marks = secs.map((s, k) => {
      const m = document.createElement("a"), kind = SEQ[k % 3];
      m.className = "mark"; m.href = `#${s.id}`; m.tabIndex = -1; m.dataset.kind = kind;
      m.innerHTML = (visual ? octa(kind) : TECH[kind]) + `<span class="tip">${s.dataset.spine} <span class="dim">/ ${NAME[kind]}</span></span>`;
      spine.appendChild(m);
      return m;
    });
  }
  function layout(): void {
    const H = spine.clientHeight, docH = document.documentElement.scrollHeight;
    secs.forEach((s, k) => { marks[k].style.top = `${Math.min(H - 16, 24 + ((s.getBoundingClientRect().top + scrollY) / docH) * (H - 40))}px`; });
    cur.style.top = `${24 + (scrollY / Math.max(1, docH - innerHeight)) * (H - 44)}px`;
  }
  const rebuild = (): void => { build(); layout(); setTimeout(layout, 60); };

  afterNavigate(() => rebuild());
  onMount(() => {
    addEventListener("scroll", layout, { passive: true });
    addEventListener("resize", layout);
    const off = onUi(rebuild);
    const ro = new ResizeObserver(() => layout()); // late content (data, fonts) changes the page height
    ro.observe(document.body);
    rebuild();
    return () => { removeEventListener("scroll", layout); removeEventListener("resize", layout); off(); ro.disconnect(); };
  });
</script>

<div class="spine" aria-hidden="true" bind:this={spine}><span class="axislabel">c</span><div class="cursor" bind:this={cur}></div></div>
