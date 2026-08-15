# Kevinception era design languages

- **Status:** Code-native six-era pass implemented August 15, 2026
- **Source of truth:** `src/experience/config.ts`
- **Runtime treatment:** `app/era-design-languages.css`

The timeline uses six related micro design systems rather than one dark-glass interface recolored six times. Each language owns a texture, chrome model, type treatment, motion character, palette, geometry, and easing curve. The shared content and interaction hierarchy stays stable so the visual changes do not compromise navigation or text-mode parity.

## Six-up system

| Era | Language | Texture | Chrome and type | Motion character |
| --- | --- | --- | --- | --- |
| 1990 · Curiosity | Broadcast phosphor | CRT scanlines | Hard square bezel, monospaced broadcast labels, yellow/green signal | Signal lock and stepped phosphor settle |
| 2000 · Identity | Portal desktop | Pixel grid | Blue desktop, beige bevel, compact utility type | Window snap and cursor trail |
| 2010 · Scale | Operational flatland | Data grid | Flat dashboard rail, dense sans-serif labels, amber/blue status | Queued rows and status pulses |
| 2020 · Influence | Vertical signal | Neon strata | Black mobile glass, compressed display type, pink/cyan split | Portrait cuts and elastic stacks |
| 2030 · Co-Existence | Ambient domestic | Warm fiber | Permissioned soft objects, quiet humanist/serif moments, amber/sage | Breath and deliberate handoff |
| 2040 · Consciousness | Holographic afterimage | Refracted rain | Black glass, sodium trace, archival signal caps | Echo, refraction, and held frames |

## Application contract

- `eraConfigs[year].designLanguage` is the typed manifest. It supplies semantic labels plus CSS-ready surface, ink, line, radius, secondary-color, and easing tokens.
- `getEraCssVariables(year)` is the only mapping from the manifest to runtime custom properties.
- The immersive overlay exposes `data-era` and `data-era-texture`. Chapter cards, navigation, interface chrome, text mode, and reduced-motion variants inherit the active vocabulary.
- Each chapter button carries its own tokens, so the persistent timeline remains a visible six-up comparison even when one chapter is active.
- The About timeline uses the same manifest and scoped `.era-echo` treatment as a restrained standard-page reference.
- The embedded 1990–2020 applications and native 2030/2040 interfaces retain their own established art direction; the parent chrome frames them instead of restyling their internals.

## Accessibility and performance boundaries

- Identity never depends on color alone: geometry, border behavior, type family, texture, and chrome all change by era.
- Texture layers are CSS gradients with no image request and `pointer-events: none`.
- Reduced-motion removes the only era-specific spatial emphasis and shortens transitions; state and hierarchy remain unchanged.
- Text and interface modes inherit the same palette tokens while retaining the existing semantic DOM and focus order.
- No new font or bitmap payload is introduced. The system reuses the self-hosted Inter/Syne output plus platform fonts.

## Acceptance boundary

The code and automated contract are complete. Final six-up screenshots, contrast sampling, and the Safari/Android/integrated-GPU review remain part of the Phase 5 browser and device gate; they are not inferred from source code.
