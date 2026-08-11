# Kevinception standard-page art direction

- **Status:** Phase 2 agent-ready pass
- **Date:** 2026-08-10

## Type

Inter remains the functional face for body copy and controls. Syne is the display face for hero and section headings plus era-neutral brand moments. Its wide, irregular geometry gives the shell a more editorial, authored silhouette without borrowing one era's native typography.

Both fonts use `next/font` and are emitted as same-origin WOFF2 files in the production export. Syne is licensed under the SIL Open Font License 1.1 through Google Fonts. The 2026-08-10 production build emitted three Syne subset files totaling 60,464 bytes (about 59.0KiB), below the roadmap's 120KB added-font budget. Variable weights 400–800 are available from one source declaration; headings use 600–700.

## Editorial rhythm

- Profile is the authored narrative: pull quote → numbered capability ledger → staggered current-work rows → principle ribbon → CTA.
- Case studies is the archive: one numbered, asymmetric project index. Full project cards do not appear on Profile.
- Home uses a compact evidence signal list with titles and roles, not duplicate archive cards.
- Project artifacts use a numbered ledger so they do not repeat the preceding outcomes grid.
- A short gradient rule marks section changes without putting every idea in a glass card.

## Signature moments

- The homepage portal is a Canvas 2D preview driven by the same six-era configuration as the immersive timeline. It does not load Three.js on the standard route.
- The experience loader reconstructs “signal · memory · interface” as a power-on sequence.
- The 404 is a lost era with a recoverable path to Timeline or Case studies.

These moments have component-specific reduced-motion treatments in `docs/MOTION.md`.
