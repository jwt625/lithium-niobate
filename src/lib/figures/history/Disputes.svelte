<!-- F7.D "Who did it first?" (manuscript sidebar D1-D13). TECH: boxed rows in a fixed-height scroll box, each expandable
     in place to its dated claims. VISUAL: one card per dispute, claims side by side under a level balance glyph (no side
     is weighted visually; the verdict line states the reading). Same claims, sources, badges in both. -->
<script lang="ts">
  import { lab } from "./labels";
  import { DISPUTES, type Claim } from "./data";
  import { HSTATUS, fm } from "./status";

  let open = $state<Record<string, boolean>>({});
  const esc = (s: string): string => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"([^"]+)"/g, "&ldquo;$1&rdquo;");
  const cites = (c: Claim): string => c.cites.map(([id, st]) => `<span class="hx-ref" data-pop="src:${id}">${lab(id)}</span>${st ? `&nbsp;<span class="b ${HSTATUS[st].cls}" data-pop="hst:${st}">${HSTATUS[st].text}</span>` : ""}`).join("; ") || `<span class="dim">unread snippet, no source held</span>`;
</script>

<div data-variant="tech" class="hx-dsp">
  <div class="hx-dsp-h"><span>#</span><span>Question</span><span>Verdict</span><span></span></div>
  <div class="hx-dsp-box">
    {#each DISPUTES as d (d.id)}
      <div class="hx-dsp-r" id={d.id.toLowerCase()}>
        <button type="button" class="hx-dsp-q" aria-expanded={!!open[d.id]} onclick={() => (open[d.id] = !open[d.id])}>
          <span class="mono">{d.id}</span><span>{@html fm(esc(d.q))}</span><span class="hx-dsp-v">{@html fm(esc(d.verdict))}</span><span class="mono" aria-hidden="true">{open[d.id] ? "-" : "+"}</span>
        </button>
        <table class="hx-dsp-c" hidden={!open[d.id]}>
          <tbody>{#each d.claims as c, i (i)}<tr><td class="mono">{c.date}</td><td>{@html fm(esc(c.text))}</td><td>{@html cites(c)}</td></tr>{/each}</tbody>
        </table>
      </div>
    {/each}
  </div>
</div>

<div data-variant="visual" class="hx-vdsp">
  {#each DISPUTES as d (d.id)}
    <article class="hx-vd" id="v{d.id.toLowerCase()}" aria-labelledby="vd-{d.id}">
      <header><span class="hx-vd-n">{d.id}</span><h3 id="vd-{d.id}">{@html fm(esc(d.q))}</h3></header>
      <svg class="hx-bal" viewBox="0 0 120 34" aria-hidden="true"><path d="M60 4 V30 M44 30 H76 M14 10 H106 M14 10 L6 22 H22 Z M106 10 L98 22 H114 Z" fill="none"/><circle cx="60" cy="10" r="2.5"/></svg>
      <div class="hx-vd-claims" style="--n:{Math.min(d.claims.length, 2)}">
        {#each d.claims as c, i (i)}
          <div class="hx-vd-c"><div class="hx-vd-d">{c.date}</div><p>{@html fm(esc(c.text))}</p><div class="hx-vd-s">{@html cites(c)}</div></div>
        {/each}
      </div>
      <p class="hx-vd-v"><span>Reading</span> {@html fm(esc(d.verdict))}</p>
    </article>
  {/each}
</div>
