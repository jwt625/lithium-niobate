<!-- VISUAL 2D cross-section of a process step (same model as the TECH ASCII view, finer columns). Material fills use
     the VISUAL material tokens (Si, SiO2, LN, Au); resist and masks without a sourced colour are hatched neutrals. -->
<script lang="ts">
  import { crossSection, svgPaths, MAT_NAME, type Geom, type Route } from "./xsec";
  let { geom, route, order, id, t, scale = "illustrative", label = "", rh = 10 }: { geom: Geom; route: Route; order: readonly string[]; id: string; t: number; scale?: "illustrative" | "true"; label?: string; rh?: number } = $props();
  const uid = $props.id();
  const COLS = 192, CW = 5;
  const RH = $derived(rh);
  const xs = $derived(crossSection(geom, route, order, id, t, scale, COLS));
  const paths = $derived(svgPaths(xs, CW, RH));
  const W = COLS * CW;
  const H = $derived(xs.rows * RH);
</script>

<svg class="mk-xs" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label || "Cross-section"}>
  <defs>
    <pattern id="h{uid}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" class="hb" /><line x1="0" y1="0" x2="0" y2="8" class="hl" /></pattern>
  </defs>
  {#each paths as p (p.m)}<path class="m-{p.m}" d={p.d} fill={p.m === "res" || p.m === "resx" || p.m === "arc" ? `url(#h${uid})` : undefined}><title>{MAT_NAME[p.m]}</title></path>{/each}
</svg>
