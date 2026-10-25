# lithium-niobate.com

A website dedicated to lithium niobate (LiNbO3): the crystal, its physics, how it is made, what it does, its history, and its industry. It aims to augment published review papers with what a PDF cannot offer: real-time 3D, interactive explanations, in-browser simulations, and provenance-tagged, machine-readable material data for people and AI agents alike.

## Current state

Build in progress (2026-10-25). SvelteKit app at the repo root; landing, chapters 03-08, chapter 2.2, Lab, Data, Library and Colophon built; chapters 01 and 02 (except 2.2) in progress (DevLog-004, DevLog-006).

- Run locally: `pnpm install`, `pnpm dev` (or `pnpm build && pnpm preview`); tests: `pnpm test:e2e`, `node --test src/lib/physics/test-all.ts`, `uv run --with pytest --with pyyaml --with jsonschema pytest tests/data`

### Build steps (in order)

1. Data/API: `uv run scripts/build_data.py` validates `data/**` against `data/schema/`, merges the chapter glossaries (`content/chapters/*/glossary.yaml`) into the site glossary, and writes `static/api/v1/**`, `static/api/openapi.json`, `static/llms.txt`, `static/llms-full.txt` and `src/lib/generated/*.json` (incl. `glossary-map.json`: chapter term -> page-local popup key -> glossary id). `--check` validates without writing.
2. SAW sweep data for figure F3.4 (only after a change to `src/lib/physics/saw.ts` or the elastic/piezoelectric constants; takes about 25 s per constant set): `node src/lib/figures/sound/gen-saw-sweep.ts` writes `static/data/sound/saw-sweep-*.json`.
3. Site: `pnpm build` runs `vite build` (prerenders every route to `build/`) and then `pagefind --site build` (search index in `build/pagefind/`, loaded by the masthead search on first open). The dev server has no search index.
4. Preview the production build: `pnpm preview` (127.0.0.1:47615).
- Plans and decisions: [DevLog/](DevLog/) (start at DevLog-004, DevLog-005, DevLog-006); research notes: [research/](research/); chapter manuscripts: [content/chapters/](content/chapters/)
- Approved visual reference: [mockup/](mockup/)

## Structure

| Path | Content |
|---|---|
| `DevLog/` | Plans, decisions, progress, audits |
| `research/` | Sourced research notes feeding the proposal |
| `src/` | SvelteKit app (routes, components, figures, physics core in `src/lib/physics/`, 3D scenes in `src/lib/scenes/`) |
| `data/`, `scripts/build_data.py`, `static/api/` | Canonical data (YAML, provenance per value) and the generated static API |
| `content/chapters/` | Chapter manuscripts, figure specs, references, glossaries |
| `mockup/` | Approved static mockup (visual reference) |

## License

Code: GPL-3.0 (see [LICENSE](LICENSE)). Data (compiled property values, records, timelines, exported datasets): CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
