// Worker: full-resolution exact conoscope frames for F2-01 (f21-cono.ts).
import { cono21RGBA, type FrameOpts } from "./f21-cono.ts";

self.onmessage = (e: MessageEvent<{ id: number; size: number; o: FrameOpts }>) => {
  const { id, size, o } = e.data;
  const px = cono21RGBA(size, o);
  (self as unknown as Worker).postMessage({ id, px }, [px.buffer]);
};
