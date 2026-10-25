// See https://svelte.dev/docs/kit/types#app.d.ts
import type { PageMeta } from "$lib/content/site";

declare global {
  namespace App {
    interface PageData {
      /** Optional per-page overrides of the shell (masthead band, footer, wafer map); defaults come from the site registry. */
      meta?: Partial<PageMeta>;
    }
  }
}

export {};
