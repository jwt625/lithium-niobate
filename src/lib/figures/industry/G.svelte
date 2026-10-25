<!-- Evidence-grade tag for industry facts (chapter 08). Grades F, V, T, C, LG, E (manuscript conventions); "reported" and
     "derived" reuse the site badge classes. TECH: mono tag, border style = grade. VISUAL: diamond glyph, fill pattern =
     grade (solid F, half V, outline T, hatched E, dotted C, cross-hatched LG). `r` names the source popup ("r:<ref id>"). -->
<script lang="ts">
  import { gradeCls } from "./refs";
  let { g, r = undefined }: { g: string; r?: string } = $props();
  const cls = $derived(g === "reported" ? "r" : g === "derived" ? "d" : `g8 ${gradeCls(g)}`);
  const label = $derived(g === "reported" || g === "derived" ? g : g.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, ""));
</script>

<span class="b {cls}" data-pop={r}>{label}</span>
