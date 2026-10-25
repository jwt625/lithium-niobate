# lithium-niobate.com

A website dedicated to lithium niobate (LiNbO3): the crystal, its physics, how it is made, what it does, its history, and its industry. It aims to augment published review papers with what a PDF cannot offer: real-time 3D, interactive explanations, in-browser simulations, and provenance-tagged, machine-readable material data for people and AI agents alike.

## Current state

Research, proposal, and static mockup phase (2026-10-25). The production site is not built yet.

- Static mockup (theme "Optic Axis", layout, core elements): [mockup/](mockup/) (serve locally, e.g. `uv run --no-project python -m http.server <port> --directory mockup`)
- Proposal: [DevLog/DevLog-001-proposal.md](DevLog/DevLog-001-proposal.md)
- Requirements and progress: [DevLog/DevLog-000-kickoff-and-requirements.md](DevLog/DevLog-000-kickoff-and-requirements.md)
- Research notes: [research/](research/) (R01..R13)
- Audits: [DevLog/audits/](DevLog/audits/)

## Structure

| Path | Content |
|---|---|
| `DevLog/` | Plans, decisions, progress, audits |
| `research/` | Sourced research notes feeding the proposal |
| `mockup/` | Static, no-build mockup of theme and layout (live conoscope hero, sample chapter page) |

## License

Code: GPL-3.0 (see [LICENSE](LICENSE)). Data license to be confirmed.
