# Kevinception V7.6 — Narrative Architecture

## Product statement

Kevinception is a journey through six stages of Kevin’s relationship with technology: **Curiosity, Connection, Commerce, Creation, Co-Existence, and Consciousness**—each experienced through a defining interface of its era.

The conceptual chapter name explains the life story. The in-world experience name preserves the era fiction and interface personality.

| Chapter | Year | In-world experience | Core transformation |
|---|---:|---|---|
| Curiosity | 1990 | KevinVision | Play becomes systems thinking. |
| Connection | 2000 | Kevin Online | Curiosity finds a network. |
| Commerce | 2010 | StealStreet Commerce OS | Connection becomes commerce. |
| Creation | 2020 | KevTok | Commerce becomes creation. |
| Co-Existence | 2030 | Morning, Together | Creation becomes co-existence. |
| Consciousness | 2040 | Morning, After | Co-Existence becomes consciousness. |

## Presentation rules

- Landing page, timeline selector, and era card prioritize the conceptual chapter name.
- Physical environment labels pair the chapter with its in-world experience.
- Functional applications prioritize the in-world experience while retaining a compact chapter indicator.
- Transition overlays communicate both the conceptual transformation and the technological match cut.
- SEO and accessibility labels include year, chapter name, and experience name.
- The canonical chapter record is defined once in `src/content/narrative.ts`.

## Flow

```text
Select chapter
→ preview physical environment
→ enter era-native interface
→ explore Kevin’s story and work
→ open the Takeaway panel
→ understand what Kevin carried forward
→ continue to the next chapter or enter Portfolio Mode
```

## Performance model

- Only the active R3F scene loads at full detail.
- Neighboring chapters render lightweight proxy environments.
- Active scene modules are code-split by year.
- Adjacent scene chunks preload during idle time on capable devices.
- Embedded applications prewarm on hover, focus, touch intent, or settled capable-device idle.
- The canvas moves to demand rendering after inactivity and pauses while the document is hidden.
- Lite mode avoids speculative prewarming.

## Review checklist

- [ ] The six conceptual names are immediately understandable without opening Help.
- [ ] KevinVision, Kevin Online, StealStreet Commerce OS, KevTok, Morning, Together, and Morning, After remain visible as experience names.
- [ ] 2030 reads first as daily life with Wren; TokenPak/TIP/PAK appears only as optional provenance.
- [ ] Every 2030 assist can be inspected as observable input, bounded interpretation, authority check, action or deliberate wait, and retention receipt without presenting hidden chain-of-thought.
- [ ] 2040 recall and hologram stability visibly honor every 2030 keep/refuse decision.
- [ ] The chapter card does not change structure between timeline and environment states.
- [ ] The persistent timeline rail always shows the active chapter outside interface/text mode.
- [ ] The interface header clearly states chapter number, chapter name, year, and experience name.
- [ ] The Takeaway panel maps each era to current Kevin capabilities.
- [ ] Adjacent transitions show meaningful chapter-to-chapter language.
- [ ] Landing and About links use `/experience/?year=` rather than legacy year routes.
- [ ] Initial experience JavaScript is lower because scene modules are split by year.
- [ ] Neighboring rooms remain recognizable without loading full scene detail.
- [ ] Idle GPU activity drops after the interaction timeout.
- [ ] Mobile chapter navigation remains horizontally usable and does not obscure the CTA.
