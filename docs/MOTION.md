# Kevinception motion language

- **Status:** Active interaction contract
- **Reduced-motion pass:** 2026-08-10

## Tokens

| Token | Value | Use |
|---|---:|---|
| `--motion-fast` | 180ms | Hover, focus, and compact state feedback |
| `--motion-medium` | 420ms | Panel reveals and era-preview changes |
| `--motion-slow` | 760ms | Authored ambient sequences only |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Elements entering or responding to input |
| `--ease-smooth` | `cubic-bezier(.65, 0, .35, 1)` | Ambient motion with no task urgency |

## Interaction inventory

| Surface | Full-motion behavior | Reduced-motion behavior |
|---|---|---|
| Primary and secondary actions | Short lift plus border/background response | No spatial lift; border and background change |
| Homepage era portal | Canvas motion, automatic era rotation, moving scan | Static canvas, manual era controls, fixed low-opacity scan |
| Portal label | Short upward reveal | Opacity reveal only |
| Lost-era 404 | Scanning signal line | Fixed line with a slow opacity shift |
| Timeline camera | Damped camera travel and parallax | Immediate camera placement, no parallax, demand rendering |
| Timeline transitions | Era-specific scale/texture transitions | Short opacity transition with a static era texture |
| Main and embedded loading | Power-on expansion, ring, and progress sweep | Opacity reveal, static full meter, slow color glow |
| Interface panels | Opacity and visibility transition | Short opacity-only transition |

The global `0.01ms` animation kill switch was removed. Reduced motion is selected from the operating-system preference on first visit, persists in the experience settings, and is handled at the component level so status changes remain visible without simulated movement.
