// Worker: exact conoscope frames (see conoscope.ts).
import { conoscopeRGBA, toLuminance } from "./conoscope.ts";
import type { ConoOpts } from "./conoscope.ts";

self.onmessage = (e: MessageEvent<{ id: number; size: number; o: ConoOpts; lum: boolean }>) => {
  const { id, size, o, lum } = e.data;
  const px = conoscopeRGBA(size, o, "exact");
  if (lum) toLuminance(px);
  (self as unknown as Worker).postMessage({ id, px }, [px.buffer]);
};
