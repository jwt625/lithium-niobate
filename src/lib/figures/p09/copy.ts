// Copy buttons: button[data-copytext] copies its attribute value; label switches to "copied" for 1.2 s (fixed width).
export function mountCopy(root: HTMLElement): () => void {
  const h = (e: Event): void => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button[data-copytext]");
    if (!b || !root.contains(b)) return;
    void navigator.clipboard?.writeText(b.dataset.copytext ?? "").then(() => { b.textContent = "copied"; setTimeout(() => { b.textContent = "copy"; }, 1200); }).catch(() => { b.textContent = "error"; });
  };
  root.addEventListener("click", h);
  return () => root.removeEventListener("click", h);
}
