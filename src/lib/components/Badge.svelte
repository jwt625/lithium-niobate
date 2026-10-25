<!-- Provenance badge. `qual` adds a display qualifier to a code without a new code (e.g. reported + "practitioner",
     P(abs) + "title"); the footer key defines the code. TECH: mono uppercase SKU tag, border style = grade (solid P, dotted P-comp/P-db, dashed derived/template).
     VISUAL: diamond glyph + word, fill = grade. `pop` names the popup entry with the source (src/lib/content/pops.ts). -->
<script lang="ts">
  import { STATUS, type StatusCode } from "$lib/content/site";
  let { code, pop = undefined, text = undefined, qual = undefined }: { code: StatusCode; pop?: string; text?: string; qual?: string } = $props();
</script>

<span class="b {STATUS[code].cls}" data-pop={pop}>{text ?? (qual ? `${code}, ${qual}` : code)}</span>
