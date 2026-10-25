// Chapter 2.2: the r-tensor explorer opens on the Kaminow et al. 1980 clamped set (listed first; author question
// DevLog-004a Q4 open). figstate.rt is shared state, so the default is applied once per runtime (server prerender and
// browser), before the first render; later reader choices persist across client-side navigation.
import { rt } from "$lib/stores/figstate";

let done = false;
export function rtDefault(): void {
  if (done) return;
  done = true;
  rt.s = "kaminow";
}
