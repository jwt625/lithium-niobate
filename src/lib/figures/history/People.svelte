<!-- F7.P People and institutions (manuscript table). TECH: boxed table. VISUAL: one cell per row with a portrait only
     where images.yaml clears it (public domain, CC0 or CC BY with credit), otherwise a 3m ornament with initials.
     Image credits listed below in both modes. -->
<script lang="ts">
  import { IMAGES, PORTRAIT_ROW, type Img } from "./data";

  let { rows, head }: { rows: string[][]; head: string[] } = $props();
  const strip = (h: string): string => h.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ");
  /** Initials of the first named person or institution in the cell. */
  function initials(h: string): string {
    const t = strip(h).replace(/\([^)]*\)/g, "").split(/[;,:]/)[0].trim();
    const caps = t.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).map((w) => w.replace(/[^A-Za-z]/g, ""));
    const last = caps[caps.length - 1] ?? t;
    const first = caps.length > 1 ? caps[0][0] : "";
    return (first + (last[0] ?? "") + (last.length > 3 && !first ? last[1] : "")).toUpperCase().slice(0, 3);
  }
  const used: Img[] = Object.values(IMAGES);
</script>

<div data-variant="tech" class="scrollx">
  <table class="idx hx-ppl">
    <thead><tr>{#each head as h (h)}<th>{h}</th>{/each}</tr></thead>
    <tbody>{#each rows as r, i (i)}<tr><td class="h">{@html r[0]}</td><td>{@html r[1]}</td><td class="mono">{@html r[2]}</td><td>{@html r[3]}</td></tr>{/each}</tbody>
  </table>
</div>

<ul data-variant="visual" class="hx-vppl">
  {#each rows as r, i (i)}
    {@const img = PORTRAIT_ROW[i] ? IMAGES[PORTRAIT_ROW[i]] : null}
    <li class="hx-vp">
      <figure class="hx-vp-f">
        {#if img}
          <img src={img.src} width={img.w} height={img.h} alt={img.caption} loading="lazy" decoding="async">
          <figcaption><span data-pop="img:{img.key}">{img.author}</span>, {#if img.licenseUrl}<a href={img.licenseUrl}>{img.license}</a>{:else}{img.license}{/if}</figcaption>
        {:else}
          <div class="hx-orn" aria-hidden="true"><span>{initials(r[0])}</span></div>
        {/if}
      </figure>
      <div class="hx-vp-t">
        <h4>{@html r[0]}</h4>
        <p>{@html r[1]}</p>
        <p class="hx-vp-y">{@html r[2]}</p>
        <p class="hx-vp-r">{@html r[3]}</p>
      </div>
    </li>
  {/each}
</ul>

<h3 class="h3">Image credits</h3>
<div class="scrollx">
  <table class="idx hx-cred">
    <thead><tr><th>Image</th><th>Author</th><th>License</th><th>File page</th></tr></thead>
    <tbody>{#each used as m (m.key)}<tr><td>{m.subject}</td><td>{m.author}</td><td class="h">{#if m.licenseUrl}<a href={m.licenseUrl}>{m.license}</a>{:else}{m.license}{/if}</td><td><a href={m.page}>Wikimedia Commons</a></td></tr>{/each}</tbody>
  </table>
</div>
<p class="fine">Licenses checked on Wikimedia Commons 2026-10-25; resized copies. Rows without a portrait have no image cleared as public domain, CC0 or CC BY.</p>
