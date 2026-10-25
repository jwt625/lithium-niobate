<!-- F05-01 Process viewer. One state (route, step, t, scale, playback) drives two designs:
     TECH: step log table, ASCII cross-section with true-scale bar, boxed HUD of PDims with SKU badges, 18 px controls.
     VISUAL: 3D stage (lane F6 core, src/lib/scenes/process; covers s07-s12, s13, s14r, s15r/s14s) or the 2D cross-section
     for the steps it does not cover, wafer site map / cross-section secondary view by layout, HUD rail with diamond badges,
     44 px transport. Deterministic: every view is a function of (route, step, t, scale); playback only moves t.
     URL hash: #route=ridge_duv&step=s17r_ln_etch&t=0.40. Keys (viewer focused): space, left/right (t), shift+left/right
     (step), [ and ] (speed). -->
<script lang="ts">
  import { onMount } from "svelte";
  import { replaceState } from "$app/navigation";
  import Badge from "$lib/components/Badge.svelte";
  import { ui } from "$lib/stores/ui.svelte";
  import { type FlowData, type PD, type StepD, routeSteps, switchRoute, mix, procTime, parseHash, hashOf, profileOf, STEP_SECONDS, SPEEDS, padL } from "./flow";
  import { crossSection, ascii, matsOf, stackAt, CHAR, MAT_NAME, COLS, type Route } from "./xsec";
  import XsSvg from "./XsSvg.svelte";
  import { stepperFieldCount } from "$lib/physics/fab.ts";

  let { flow, hashSync = true, uid = "pv" }: { flow: FlowData; hashSync?: boolean; uid?: string } = $props();

  let route = $state<Route>("ridge_duv");
  let idx = $state(0);
  let t = $state(0);
  let playing = $state(false);
  let dir = $state<1 | -1>(1);
  let speedI = $state(1);
  let loop = $state(false);
  let scale = $state<"illustrative" | "true">("illustrative");
  let layout = $state<"main" | "inset" | "side" | "stack" | "swap">("inset");

  const steps = $derived(routeSteps(flow, route));
  const N = $derived(steps.length);
  const step = $derived(steps[Math.min(idx, N - 1)]);
  const order = $derived(flow.order[route]);
  const xs = $derived(crossSection(flow.geom, route, order, step.id, t, scale));
  const art = $derived(ascii(xs).join("\n"));
  const mats = $derived(matsOf(xs));
  const stack = $derived(stackAt(flow.geom, route, order, step.id, t));
  const prof = $derived(profileOf(flow, step, route));
  const params = $derived(step.params.filter((p) => !p.r || p.r.includes(route)));
  const ROWS_HUD = 9;
  const scrubV = $derived(idx + t);
  const routeLabel = $derived(flow.routes.find((r) => r.id === route)?.label ?? route);

  // ---------- 3D (lane F6) coverage
  let f6Ids = $state<Record<string, string[]>>({});
  const f6Index = $derived((f6Ids[route] ?? []).indexOf(step.id));
  const has3d = $derived(f6Index >= 0);

  // ---------- readouts
  const nn = (k: number, n: number): string => String(k).padStart(n, "0");
  const stepNo = $derived(`${nn(idx + 1, 2)}/${nn(N, 2)}`);
  const ptime = $derived(procTime(step, t));
  const fmtMix = (s: StepD): string => { const m = mix(s, route); return `${m.r}r ${m.d}d ${m.t}t ${m.n}n${m.a ? ` a${m.a}` : ""}`.padEnd(13, " "); };
  const fields = stepperFieldCount(100, 22, 8).count;
  const scaleNote = $derived.by(() => {
    if (xs.kind === "boule") return "boule scale: crystal 153 mm × 110 mm to scale; 1 row = 10 mm";
    if (scale === "true") {
      const film = stack.film > 0 ? stack.film : 0;
      return `true scale: 1 row = ${(xs.umPerRow ?? 0).toFixed(1)} µm of a ${xs.stackUm.toFixed(1)} µm stack${film ? `; LN film ${(film * 1000).toFixed(0)} nm = ${((film / xs.stackUm) * 100).toFixed(2)}% (below one row)` : ""}`;
    }
    return "illustrative z-map: Si 4 rows, oxide 3 rows, donor bulk 8 rows, films 1 row = 0.15 µm";
  });
  const profPath = $derived.by(() => {
    if (!prof) return null;
    const lo = Math.min(...prof.y), hi = Math.max(...prof.y), span = hi - lo || 1;
    const X = (x: number): number => 6 + x * 208, Y = (y: number): number => 54 - ((y - lo) / span) * 44;
    const d = prof.x.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(prof.y[i]).toFixed(1)}`).join("");
    let yc = prof.y[0];
    for (let i = 1; i < prof.x.length; i++) if (t <= prof.x[i]) { const f = (t - prof.x[i - 1]) / (prof.x[i] - prof.x[i - 1] || 1); yc = prof.y[i - 1] + f * (prof.y[i] - prof.y[i - 1]); break; } else yc = prof.y[i];
    return { d, cx: X(t), cy: Y(yc), lo, hi, yc };
  });
  const fmtNum = (v: number): string => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2));

  // ---------- navigation
  function go(k: number, tt = 0): void { idx = Math.max(0, Math.min(N - 1, k)); t = Math.max(0, Math.min(1, tt)); writeHash(); }
  function setRoute(r: Route): void {
    if (r === route) return;
    const id = switchRoute(flow, route, r, step.id);
    route = r;
    idx = Math.max(0, flow.order[r].indexOf(id));
    writeHash();
  }
  function scrub(v: number): void {
    if (v >= N) { idx = N - 1; t = 1; } else { idx = Math.floor(v); t = v - idx; }
    writeHash();
  }
  const stepBy = (d: number): void => { playing = false; go(idx + d, 0); };

  // ---------- playback (equal duration per step at 1x; reader-started only)
  let raf = 0, last = 0;
  function frame(now: number): void {
    if (!playing) return;
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    let tt = t + (dir * dt * SPEEDS[speedI]) / (STEP_SECONDS * step.weight);
    let k = idx;
    if (tt > 1) { if (k < N - 1) { k++; tt -= 1; } else if (loop) { k = 0; tt = 0; } else { tt = 1; playing = false; } }
    if (tt < 0) { if (k > 0) { k--; tt += 1; } else if (loop) { k = N - 1; tt = 1; } else { tt = 0; playing = false; } }
    const changed = k !== idx;
    idx = k; t = tt;
    if (changed || !playing) writeHash();
    if (playing) raf = requestAnimationFrame(frame);
  }
  function play(d: 1 | -1): void {
    if (playing && dir === d) { playing = false; cancelAnimationFrame(raf); writeHash(); return; }
    dir = d;
    if (d === 1 && idx === N - 1 && t >= 1) { idx = 0; t = 0; }
    if (d === -1 && idx === 0 && t <= 0) { idx = N - 1; t = 1; }
    playing = true; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }

  // ---------- URL hash
  let hashT = 0;
  function writeHash(): void {
    if (!hashSync || typeof window === "undefined") return;
    clearTimeout(hashT);
    hashT = window.setTimeout(() => { try { replaceState(hashOf(route, step.id, t), {}); } catch { /* router not ready */ } }, 120);
  }
  function readHash(): void {
    const h = parseHash(location.hash);
    if (!h) return;
    if (h.route) route = h.route;
    const k = h.step ? flow.order[route].indexOf(h.step) : -1;
    if (k >= 0) idx = k;
    if (h.t !== undefined) t = h.t;
  }

  // ---------- keyboard (viewer focused)
  function onKey(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" && (e.key === "ArrowLeft" || e.key === "ArrowRight")) return;
    if (e.key === " " && tag !== "BUTTON") { e.preventDefault(); play(dir); }
    else if (e.key === "ArrowRight") { e.preventDefault(); if (e.shiftKey) stepBy(1); else scrub(Math.min(N, scrubV + 0.05)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); if (e.shiftKey) stepBy(-1); else scrub(Math.max(0, scrubV - 0.05)); }
    else if (e.key === "]") speedI = Math.min(SPEEDS.length - 1, speedI + 1);
    else if (e.key === "[") speedI = Math.max(0, speedI - 1);
  }

  // ---------- step table scroll (inside its own box, never the page)
  let tbox: HTMLDivElement | undefined = $state();
  $effect(() => {
    void idx; void route;
    if (!tbox) return;
    const row = tbox.querySelector<HTMLElement>(`tr[data-i="${idx}"]`);
    if (!row) return;
    const top = row.offsetTop - 22, bottom = top + row.offsetHeight + 22;
    if (top < tbox.scrollTop) tbox.scrollTop = top; else if (bottom > tbox.scrollTop + tbox.clientHeight) tbox.scrollTop = bottom - tbox.clientHeight;
  });

  // ---------- 3D mount (VISUAL only, lazy)
  let stage3d: HTMLDivElement | undefined = $state();
  let scene: { setState: (p: Record<string, unknown>) => void; setTheme: (t?: "dark" | "light") => void; dispose: () => void } | null = null;
  let loading = false;
  async function ensure3d(): Promise<void> {
    if (scene || loading || !stage3d || ui.mode !== "visual") return;
    loading = true;
    try {
      const mod = await import("$lib/scenes/index.ts");
      f6Ids = { ridge_duv: mod.routeSteps("ridge_duv").map((s) => s.id), strip_dlc: mod.routeSteps("strip_dlc").map((s) => s.id) };
      const { mount } = await mod.scenes["process-viewer"]();
      if (!stage3d) return;
      scene = mount(stage3d, { mode: "visual", state: { route, step: Math.max(0, f6Index), t, scale, inset: layout === "inset" }, label: "Process viewer 3D scene; drag to orbit" }) as unknown as typeof scene;
    } catch { scene = null; } finally { loading = false; }
  }
  $effect(() => {
    // keep the scene in sync (only meaningful for covered steps)
    const st = { route, step: Math.max(0, f6Index), t: has3d ? t : 0, scale, inset: layout === "inset" };
    if (ui.mode === "visual") void ensure3d();
    scene?.setState(st);
  });
  $effect(() => { void ui.theme; scene?.setTheme(ui.theme); });

  onMount(() => {
    if (hashSync) readHash();
    const onHash = (): void => readHash();
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("hashchange", onHash); cancelAnimationFrame(raf); clearTimeout(hashT); scene?.dispose(); scene = null; };
  });

  const WORDS: Record<string, string> = { li2o: "Li2O", li2co3: "Li2CO3", nb2o5: "Nb2O5", co2: "CO2", sio2: "SiO2", si3n4: "Si3N4", ln: "LN", lt: "LT", dlc: "DLC", arc: "ARC", ebl: "EBL", sc1: "SC-1", rf: "RF", duv: "DUV", he: "He", h: "H" };
  const plabel = (k: string): string => k.split("_").map((w) => (WORDS[w] ?? w).replace(/([A-Za-z])(\d)/g, "$1<sub>$2</sub>").replace(/<\/sub>(\d)/g, "$1</sub>")).join(" ");
  const PHASE_NAME: Record<string, string> = { crystal: "Crystal", wafer: "Wafer", lnoi: "LNOI", device: "Device", backend: "Back end" };
  const PH_CLS: Record<string, string> = { crystal: "p0", wafer: "p1", lnoi: "p2", device: "p3", backend: "p4" };
  const stLabel = (p: PD): string => (p.st === "na" ? "n/a" : p.st);
  const LAYOUTS: [typeof layout, string][] = [["main", "Main"], ["inset", "Inset"], ["side", "Side by side"], ["stack", "Stacked"], ["swap", "Swap"]];
</script>

{#snippet pbadge(p: PD)}
  {#if p.st === "na"}<span class="b u mk-na" data-pop={p.pop}>n/a</span>{:else}<Badge code={p.st as "reported"} pop={p.pop} />{/if}{#if p.an}<span class="mk-an" data-pop={p.pop}>analog</span>{/if}
{/snippet}

{#snippet ticks()}
  <svg class="mk-ticks" viewBox="0 0 1000 10" preserveAspectRatio="none" aria-hidden="true">
    {#each steps as s, i (s.id)}<rect class="{PH_CLS[s.phase]}{i === idx ? ' on' : ''}" x={(i / N) * 1000 + 1} y="0" width={1000 / N - 2} height="10" />{/each}
  </svg>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="mk-pv" id={uid} tabindex="-1" onkeydown={onKey} role="group" aria-label="Process viewer">
  <!-- ======================= TECH ======================= -->
  <figure class="panel mk-pv-t" data-variant="tech">
    <div class="ph"><span>Process viewer: x-cut TFLN Mach-Zehnder modulator, charge to fibered chip</span><span class="mk-stepno">{stepNo}</span></div>
    <div class="mk-pv-bar">
      <div class="seg" role="group" aria-label="Route">{#each flow.routes as r (r.id)}<button type="button" class:on={route === r.id} onclick={() => setRoute(r.id)}>{r.id === "ridge_duv" ? "RIDGE DUV" : "STRIP DLC"}</button>{/each}</div>
      <div class="seg" role="group" aria-label="Transport">
        <button type="button" title="First step" onclick={() => { playing = false; go(0, 0); }}>|&lt;</button>
        <button type="button" title="Step back (shift+left)" onclick={() => stepBy(-1)}>&lt;</button>
        <button type="button" title="Play backward" class:on={playing && dir === -1} onclick={() => play(-1)}>REV</button>
        <button type="button" title="Play / pause (space)" class:on={playing && dir === 1} onclick={() => play(1)}>{playing && dir === 1 ? "PAUSE" : "PLAY "}</button>
        <button type="button" title="Step forward (shift+right)" onclick={() => stepBy(1)}>&gt;</button>
        <button type="button" title="Last step" onclick={() => { playing = false; go(N - 1, 1); }}>&gt;|</button>
      </div>
      <div class="seg" role="group" aria-label="Speed">{#each SPEEDS as s, i (s)}<button type="button" class:on={speedI === i} onclick={() => (speedI = i)}>{s}X</button>{/each}</div>
      <div class="seg" role="group" aria-label="Loop"><button type="button" class:on={loop} onclick={() => (loop = !loop)}>LOOP</button></div>
      <div class="seg" role="group" aria-label="Scale"><button type="button" class:on={scale === "illustrative"} onclick={() => (scale = "illustrative")}>ILLUSTRATIVE</button><button type="button" class:on={scale === "true"} onclick={() => (scale = "true")}>TRUE SCALE</button></div>
    </div>
    <div class="mk-scrub">
      <div class="mk-track">{@render ticks()}<input type="range" min="0" max={N} step="0.001" value={scrubV} aria-label="Scrub through the process (step plus fraction)" oninput={(e) => { playing = false; scrub(+(e.currentTarget as HTMLInputElement).value); }} /></div>
      <output class="mk-t">t {t.toFixed(2)}</output>
    </div>
    <div class="mk-pv-grid">
      <div class="mk-steps" bind:this={tbox}>
        <table class="log mk-log">
          <thead><tr><th>#</th><th>STEP</th><th>TOOL</th><th>T_PROC</th><th>STATUS MIX</th></tr></thead>
          <tbody>
            {#each steps as s, i (s.id)}
              <tr data-i={i} class:on={i === idx} onclick={() => { playing = false; go(i, 0); }}><td>{nn(i + 1, 2)}</td><td class="e" title={s.name}>{s.name}</td><td>{s.tool}</td><td>{@html s.dur.st === "na" ? "n/a" : `${s.dur.v} ${s.dur.u}`}</td><td>{fmtMix(s)}</td></tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="mk-xsbox">
        <div class="mk-xshead"><span class="mk-sname" title={step.name}>{step.name}</span></div>
        <pre class="mk-ascii" aria-label="ASCII cross-section of the current step">{art}</pre>
        <div class="mk-xsfoot">
          <div class="mk-scale">{scaleNote}</div>
          <div class="mk-legend">{#each mats as m (m)}<span><b>{CHAR[m]}</b> {MAT_NAME[m]}</span>{/each}</div>
          <div class="mk-gizmo">{#if xs.gizmo}LN axes on screen: up {xs.gizmo.up}, right {xs.gizmo.right}, wave along Y (into the page){:else}&nbsp;{/if}</div>
        </div>
      </div>
    </div>
    <table class="kv mk-hud">
      <colgroup><col class="cn"><col><col class="cs2"></colgroup>
      <tbody>
        <tr><td>Step</td><td class="v l">{stepNo}</td><td class="s"></td></tr>
        <tr><td>Route</td><td class="v l">{routeLabel}</td><td class="s"></td></tr>
        <tr><td>Equipment</td><td class="v l" title={step.part}>{step.tool}: {step.part}</td><td class="s"></td></tr>
        <tr><td>Process time</td><td class="v l">{ptime} <span class="dim">{step.tmin === null ? "not reported" : step.tlabel}</span></td><td class="s">{@render pbadge(step.dur)}</td></tr>
        {#each Array(ROWS_HUD) as _, i (i)}
          {@const p = params[i]}
          <tr class:empty={!p}><td>{@html p ? plabel(p.k) : ""}</td><td class="v l" title={p ? p.v.replace(/<[^>]+>/g, "") : ""}>{#if p}{@html p.v}{#if p.u && p.v !== "n/a"}&nbsp;{@html p.u}{/if}{/if}</td><td class="s">{#if p}{@render pbadge(p)}{/if}</td></tr>
        {/each}
      </tbody>
    </table>
    <div class="mk-prof">
      {#if prof && profPath}
        <svg viewBox="0 0 220 60" class="mk-profsvg" role="img" aria-label="Profile {prof.label}"><path class="ax" d="M6 54H214M6 10V54" /><path class={prof.st === "template" ? "pl t" : "pl"} d={profPath.d} /><circle cx={profPath.cx} cy={profPath.cy} r="2.5" class="cur" /></svg>
        <div class="mk-proft"><span>{@html prof.label} {fmtNum(profPath.yc)} {@html prof.unit}</span> <Badge code={(prof.st === "na" ? "template" : prof.st) as "reported"} /> <span class="dim">{prof.note}</span></div>
      {:else}
        <div class="mk-proft dim">No time profile for this step.</div>
      {/if}
    </div>
    <div class="pf">Badges: reported (anchor or analog paper at the locator), derived (computed from other step values), template (not reported; illustrative), n/a (not reported, not drawn). Playback: {STEP_SECONDS} s per step at 1x; real process time in the HUD. Stepper fields per 100 mm wafer: {fields} (derived).</div>
  </figure>

  <!-- ======================= VISUAL ======================= -->
  <figure class="mk-pv-v" data-variant="visual">
    <div class="mk-v-head">
      <div class="mk-v-no"><span class="v-num">{stepNo}</span><span class="mk-v-ph">{PHASE_NAME[step.phase] ?? step.phase}</span></div>
      <div class="mk-v-name" title={step.name}>{step.name}</div>
    </div>
    <div class="mk-v-main">
      <div class="mk-v-stage lay-{has3d ? layout : 'main'}">
        <div class="mk-v-a" bind:this={stage3d} class:hide={!has3d}></div>
        <div class="mk-v-b" class:hide={has3d && (layout === "main" || layout === "inset")}>
          <XsSvg geom={flow.geom} {route} {order} id={step.id} {t} {scale} rh={has3d ? 18 : 25} label="2D cross-section of {step.name}" />
        </div>
        <div class="mk-v-gap" class:hide={has3d}>2D cross-section; no 3D model for this step</div>
        <div class="mk-v-legend" class:hide={has3d && (layout === "main" || layout === "inset")}>{#each mats as m (m)}<span><i class="sw m-{m}"></i>{MAT_NAME[m]}</span>{/each}</div>
        <div class="mk-v-giz" class:hide={has3d && (layout === "main" || layout === "inset")}>{#if xs.gizmo}LN axes: up {xs.gizmo.up}, right {xs.gizmo.right}{/if}</div>
      </div>
      <aside class="mk-v-rail">
        <dl class="mk-v-hud">
          <dt>Route</dt><dd title={routeLabel}>{routeLabel}</dd>
          <dt>Equipment</dt><dd title={step.part}>{step.tool}</dd>
          <dt>Process time</dt><dd class="v-num">{ptime}</dd>
          <dt>Status mix</dt><dd class="v-num" title="reported, derived, template, n/a; analog count">{fmtMix(step)}</dd>
        </dl>
        <ul class="mk-v-params">
          {#each Array(ROWS_HUD) as _, i (i)}
            {@const p = params[i]}
            <li class:empty={!p}>{#if p}<span class="k">{@html plabel(p.k)}</span><span class="val v-num">{@html p.v}{#if p.u && p.v !== "n/a"}&nbsp;{@html p.u}{/if}</span><span class="bd">{@render pbadge(p)}</span>{/if}</li>
          {/each}
        </ul>
        <div class="mk-v-prof">
          {#if prof && profPath}
            <svg viewBox="0 0 220 60" role="img" aria-label="Profile {prof.label}"><path class="ax" d="M6 54H214M6 10V54" /><path class={prof.st === "template" ? "pl t" : "pl"} d={profPath.d} /><circle cx={profPath.cx} cy={profPath.cy} r="3" class="cur" /></svg>
            <span class="v-num">{@html prof.label} {fmtNum(profPath.yc)} {@html prof.unit}</span>
          {:else}<span class="dim">No time profile for this step.</span>{/if}
        </div>
      </aside>
    </div>
    <div class="mk-v-transport">
      <div class="mk-scrub v">
        <div class="mk-track">{@render ticks()}<input type="range" min="0" max={N} step="0.001" value={scrubV} aria-label="Scrub through the process" oninput={(e) => { playing = false; scrub(+(e.currentTarget as HTMLInputElement).value); }} /></div>
      </div>
      <div class="mk-v-ctl">
        <div class="v-seg" role="group" aria-label="Transport">
          <button type="button" aria-label="Step back" onclick={() => stepBy(-1)}><svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4 3 10l7 6zM17 4l-7 6 7 6z"/></svg></button>
          <button type="button" aria-label="Play backward" class:on={playing && dir === -1} onclick={() => play(-1)}><svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M15 4 5 10l10 6z"/></svg></button>
          <button type="button" aria-label="Play or pause" class:on={playing && dir === 1} onclick={() => play(1)}>{#if playing && dir === 1}<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z"/></svg>{:else}<svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4l10 6-10 6z"/></svg>{/if}</button>
          <button type="button" aria-label="Step forward" onclick={() => stepBy(1)}><svg class="ic" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4l7 6-7 6zM10 4l7 6-7 6z"/></svg></button>
        </div>
        <div class="v-seg" role="group" aria-label="Speed">{#each SPEEDS as s, i (s)}<button type="button" class:on={speedI === i} onclick={() => (speedI = i)}>{s}×</button>{/each}</div>
        <div class="v-seg" role="group" aria-label="Route">{#each flow.routes as r (r.id)}<button type="button" class:on={route === r.id} onclick={() => setRoute(r.id)}>{r.id === "ridge_duv" ? "Ridge" : "Strip"}</button>{/each}</div>
        <div class="v-seg" role="group" aria-label="Scale"><button type="button" class:on={scale === "illustrative"} onclick={() => (scale = "illustrative")}>Illustrative</button><button type="button" class:on={scale === "true"} onclick={() => (scale = "true")}>True scale</button></div>
        <div class="v-seg mk-lay" role="group" aria-label="Layout" class:dis={!has3d}>{#each LAYOUTS as [k, l] (k)}<button type="button" class:on={layout === k} aria-disabled={!has3d} onclick={() => (layout = k)}>{l}</button>{/each}</div>
        <div class="v-seg" role="group" aria-label="Loop"><button type="button" class:on={loop} onclick={() => (loop = !loop)}>Loop</button></div>
      </div>
    </div>
    <p class="v-cap mk-v-scale">{scaleNote}.</p>
    <p class="v-cap mk-v-cap">Badges: <Badge code="reported" /> anchor or analog paper at the locator, <Badge code="derived" /> computed from other step values, <Badge code="template" /> not reported, illustrative; n/a: not reported, not drawn. Status mix: reported, derived, template, n/a, and analog count. Playback {STEP_SECONDS} s per step at 1×; real process time in the HUD. Stepper fields per 100 mm wafer: {fields} (derived). Keys with the viewer focused: space, arrows, shift+arrows, [ ].</p>
  </figure>
</div>
