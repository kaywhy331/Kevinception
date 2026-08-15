# Kevinception motion language

- **Status:** Active interaction contract
- **Reduced-motion and micro-interaction pass:** 2026-08-15

## Tokens

| Token | Value | Use |
|---|---:|---|
| `--motion-fast` | 180ms | Hover, focus, and compact state feedback |
| `--motion-medium` | 420ms | Panel reveals and era-preview changes |
| `--motion-slow` | 760ms | Authored ambient sequences only |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` | Elements entering or responding to input |
| `--ease-smooth` | `cubic-bezier(.65, 0, .35, 1)` | Ambient motion with no task urgency |
| `--ease-spring` | `cubic-bezier(.2, .8, .2, 1.18)` | Small directional affordances such as link arrows |

## Interaction inventory

| Surface | Full-motion behavior | Reduced-motion behavior |
|---|---|---|
| Primary actions | Bounded cursor-relative magnetism, short lift, press compression, and focus ring on fine pointers | No spatial response; border, background, and focus-ring change |
| Secondary actions | Short lift plus border/background response | No spatial lift; border and background change |
| Text and navigation links | Directional underline; text-link arrow follows intent | Underline and color response without arrow translation |
| Case-study cards | Maximum 2.2° cursor-relative tilt with a local pointer glow | Static card with border and shadow response |
| Standard route changes | View Transition snapshots: short old-page lift and authored new-page settle | Native immediate route change; no transition interception |
| Standard-page sections | Intersection-triggered opacity and 1.4rem settle; short sibling stagger | Intersection-triggered opacity only, without stagger or translation |
| Case-study chapters | Sticky semantic rail tracks the chapter crossing the reading band | Same sticky rail and state change, without spatial animation |
| Homepage era portal | Canvas motion, automatic era rotation, moving scan | Static canvas, manual era controls, fixed low-opacity scan |
| Portal label | Short upward reveal | Opacity reveal only |
| Lost-era 404 | Scanning signal line | Fixed line with a slow opacity shift |
| Timeline camera | Damped camera travel and parallax | Immediate camera placement, no parallax, demand rendering |
| Timeline transitions | Era-specific scale/texture transitions | Short opacity transition with a static era texture |
| Main and embedded loading | Power-on expansion, ring, and progress sweep | Opacity reveal, static full meter, slow color glow |
| Interface panels | Opacity and visibility transition | Short opacity-only transition |

The global `0.01ms` animation kill switch was removed. Reduced motion is selected from the operating-system preference on first visit, persists in the experience settings, and is handled at the component level so status changes remain visible without simulated movement.

## Capability boundary

`MicroInteractions` uses one passive delegated pointer listener instead of attaching handlers to every control. Spatial enhancements activate only when `(hover: hover) and (pointer: fine)` matches and the operating system does not request reduced motion. The runtime clears its custom properties on pointer exit, window blur, visibility loss, capability changes, and unmount.

The standard-page runtime deliberately skips `.experience-root`; immersive controls continue to follow the persisted Full/Reduced setting in the experience store. Coarse pointers, touch-only devices, print, and reduced-motion states keep all controls functional and use non-spatial CSS feedback. Magnetism and tilt never encode state or gate an action.

## Page choreography boundary

Eligible unmodified, same-origin links between standard routes use the browser View Transitions API when it exists. External links, downloads, modifier/middle clicks, hash navigation, same-path changes, opt-outs, Experience routes, unsupported browsers, and reduced-motion preferences retain native navigation. The transition waits for the App Router pathname commit and has a two-second fail-open timeout.

Scroll reveals are progressive enhancement: source content remains visible until the client adds `data-choreography="ready"`. IntersectionObserver reveals prepared sections once; MutationObserver covers client-rendered archive results. Without IntersectionObserver, prepared content is made visible immediately. Case-study chapter markers are server-rendered hash links with stable section IDs; active tracking is optional and never required for navigation.
