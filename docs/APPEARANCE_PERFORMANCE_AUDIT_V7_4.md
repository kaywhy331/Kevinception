# Kevinception V7.4 — Appearance, Flow, and Performance Pass

**Scope:** timeline presentation, ultrawide framing, distant-year navigation, future-wing scene cost, interface startup, and low-power defaults.

## Findings

### Current-room focus

On ultrawide displays, a fixed vertical field of view exposed too much horizontal scene area. The selected room occupied less of the viewport while both neighboring rooms competed at near-equal brightness. This made the timeline feel like three simultaneous displays rather than one focused memory with adjacent context.

### Distant-year navigation

A direct selection such as 1990 → 2040 still used the same camera-travel behavior as an adjacent move. The camera crossed roughly sixty world units while the source environment and both future environments could be mounted together. The result was a perceptible delay and unnecessary scene churn.

### Future-wing runtime cost

2030 and 2040 intentionally remain physically connected. Both full scenes, however, contain the most transparent panels, geometry, animated nodes, point lights, particles, and procedural hologram data in the experience. Rendering both at full detail whenever either was adjacent was unnecessary.

### Interface startup

The functional iframe did not begin loading until the visitor entered an era. For most eras this created a second wait after the 3D transition. Kevin Online is intentionally excluded from prewarming so its WinDohs startup and Sign On sequence begin when the visitor explicitly enters.

### Low-power devices

The default Standard mode was acceptable on many laptops but unnecessarily expensive for narrow mobile devices, save-data connections, and devices reporting low memory or CPU concurrency.

## Implemented changes

### Responsive authored camera

- Camera field of view now preserves an approximately consistent horizontal composition across common aspect ratios.
- Ultrawide displays use tighter vertical FOV and slightly closer authored poses.
- The selected room occupies more of the viewport and the unused black area above the environments is reduced.
- Pointer parallax is reduced and disabled during direct temporal jumps.

### Neighbor focus treatment

- Mounted neighboring rooms receive a non-interactive dark focus veil.
- The architecture remains visible, but inactive props no longer compete with the selected room.
- The veil disappears for the active room and is not rendered over interface or text modes.

### Direct temporal jumps

- Non-adjacent years use a dedicated `time-jump` transition.
- A 1990 → 2040 preview now resolves in approximately 300 ms under full-motion settings.
- Direct non-adjacent interface entry resolves in approximately 390 ms.
- The camera snaps to the destination while a brief temporal-jump overlay hides the discontinuity.
- Adjacent moves retain authored camera travel and era-to-era transformations.
- Rapid input may interrupt and replace an in-progress transition instead of being ignored.

### Staged scene mounting

- During `time-jump`, the source scene is no longer retained after the destination becomes active.
- The current, previous, and next render band remains intact for normal exploration.
- The 2030/2040 physical relationship is preserved with a lightweight neighbor representation.
- Only the active future environment renders its full agents, evidence surfaces, particles, hologram, memory shards, and dynamic lights.

### Interface prewarming

- After a visitor settles on an era for 850 ms, the selected non-2000 application begins loading while hidden.
- The cache remains bounded to two applications.
- Kevin Online is excluded so its startup and dial-up sequence remain intentional.

### Adaptive low-power default

On a first visit, Lite quality is selected when one or more of these signals indicate a constrained device:

- Viewport narrower than 760 px
- Reported device memory of 4 GB or less
- Four or fewer logical CPU cores
- Browser save-data preference

A visitor can still select Standard or High quality in Settings.

## Flow targets

| Interaction | Full-motion target |
|---|---:|
| Adjacent year preview | ~420 ms |
| Distant year preview | ~300 ms |
| Enter current selected era | ~250 ms before interface reveal |
| Enter a distant era directly | ~390 ms before interface reveal |
| Return to timeline | ~300 ms |

These durations describe the authored shell transition. First-time iframe content can still depend on browser storage, CPU, and local static-asset cache; idle prewarming reduces that delay for five of the six eras.

## Automated validation

The regression suite now verifies:

- Distant years use `time-jump`
- The source scene is omitted during distant jumps
- Future neighbors use lightweight detail modes
- Inactive animations remain paused
- Responsive FOV is capped for ultrawide and portrait displays
- Neighbor focus veils are present
- Interface prewarming remains bounded and excludes 2000
- Existing route, gesture, history, accessibility, build, link, and security checks remain intact

## Manual visual and performance review

Before merging, inspect at 16:9, 21:9, 32:9, tablet landscape, and mobile portrait:

1. Select 1990, then click 2040 directly. The destination should appear through a brief temporal jump rather than a long pan.
2. Move sequentially 1990 → 2000 → 2010. Adjacent camera movement should remain readable and continuous.
3. Confirm the current environment is dominant while neighboring rooms remain recognizable but subdued.
4. Enter 2010 or 2020 after waiting one second on its environment. The application should usually appear without a second loading delay.
5. Confirm 2000 still begins at WinDohs startup and does not silently progress before entry.
6. Compare Standard and Lite modes in browser performance tools while switching repeatedly between 1990 and 2040.
7. Watch GPU memory during 20 repeated distant jumps. Memory should stabilize rather than grow continuously.
