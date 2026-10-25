import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { mdsvex } from "mdsvex";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: [".svelte", ".svx"],
  preprocess: [vitePreprocess(), mdsvex({ extensions: [".svx"] })],
  kit: {
    // Static site: every route is prerendered to build/ (no server). Directory-style URLs (/light/pockels-effect/).
    adapter: adapter({ pages: "build", assets: "build", fallback: undefined, precompress: false, strict: true }),
    // Missing anchors fail the build, except URL-hash state such as /making/process-viewer/#route=...&step=...&t=...
    // (key=value fragments are app state read by the page, not element ids).
    prerender: {
      entries: ["*"],
      handleHttpError: "fail",
      handleMissingId: ({ id, message }) => { if (!id.includes("=")) throw new Error(message); },
    },
    inlineStyleThreshold: 0,
  },
};

export default config;
