// Depth index (chapter pages): highlights the layer crossing a band 45-50% down the viewport (port of mockup eo.js).
/** Depth switch: mark the layer crossing the band 45-50% down the viewport (tracked as a set). */
export function mountDepthNav(nav: HTMLElement, ids: string[]): () => void {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>("a")];
  const inBand = new Set<string>();
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) inBand.add(en.target.id); else inBand.delete(en.target.id); });
    const cur = [...ids].reverse().find((id) => inBand.has(id));
    if (cur) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${cur}`));
  }, { rootMargin: "-45% 0px -50% 0px" });
  ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  return () => io.disconnect();
}
