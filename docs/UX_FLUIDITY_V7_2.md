# Kevinception V7.2 — Flow and Performance Pass

**Status:** Implemented on the connected-environment branch  
**Scope:** Navigation, transition coordination, mobile gestures, application persistence, and R3F runtime cost

## Product correction

The persistent `/experience/` route is now the primary timeline surface.

```text
Select a year
  → preview its physical environment
  → press the primary era action
  → enter the functional interface directly
```

Normal exploration no longer sends the visitor through a second `/experience/[year]/` confirmation page. Historical year routes remain compatible and normalize into the equivalent query-state URL.

Examples:

```text
/experience/?year=1990
/experience/?year=1990&view=interface
/experience/?year=2040&view=text
```

## Implemented UX improvements

- Separate preview and direct-entry actions
- Direct Timeline CTA to the functional era interface
- Browser Back/Forward synchronization for year and view
- Old `/experience/[year]/` route normalization
- Horizontal swipe support
- Trackpad and mouse-wheel timeline movement with cooldown
- One-time gesture and keyboard guidance
- Escape hierarchy for settings, help, artifacts, interfaces, text mode, and environment mode
- Persistent current and recently used iframe applications across Step Back
- Embedded intro auto-skip for 1990, 2010, 2020, 2030, and 2040
- Intentional preservation of WinDohs startup and Kevin Online Sign On in 2000
- Era-specific interface loading state
- Compact mobile and desktop interface controls

## Runtime improvements

The R3F world now mounts a render band instead of six complete environments at once:

```text
active year
previous neighbor
next neighbor
transition endpoints
2030 + 2040 together when the future wing is active
```

Additional reductions:

- Lower High, Standard, and Lite DPR ceilings
- Adaptive DPR support
- Lower postprocessing intensity
- Reduced shadow-map cost
- Fewer dynamic lights in inactive rooms
- Paused inactive modem, social, reaction, agent, context-packet, hologram, memory-shard, artifact, and screen animations
- Reduced particle counts in the most expensive scenes
- Reused camera look-at vectors and cancelled superseded GSAP tweens
- Future data conduit pauses outside the future wing

## Interaction contract

| Input | Timeline / environment | Interface |
|---|---|---|
| Left / Right | Preview adjacent year | Owned by the embedded application |
| Swipe | Preview adjacent year | Disabled so interface scrolling remains native |
| Wheel / trackpad | Preview adjacent year after threshold | Owned by the embedded application |
| Enter | Open selected era directly | Owned by the embedded application |
| Escape | Close top layer or return to timeline | Step back from the interface |
| T | Return to timeline | Return to timeline |

## Acceptance conditions

- Year preview remains inside `/experience/`.
- Primary Enter action opens the application without a duplicate confirmation page.
- Browser history restores both year and view.
- Rapid input cannot leave stale transition timers active.
- Only a bounded group of 3D scenes is mounted.
- Inactive scenes stop their animation loops.
- Step Back and reopen preserve the current application document.
- Mobile swipe does not conflict with vertical interface scrolling.
- Kevin Online still begins with its authentic startup and Sign On journey.
- Text and no-WebGL experiences remain complete.
