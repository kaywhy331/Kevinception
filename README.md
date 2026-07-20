# Kevinception V7 — R3F-first hybrid rebuild

Kevinception V7 is a persistent React Three Fiber experience wrapped around functional, semantic portfolio applications.

## Windows package-root check

This 0.8.0 archive is flat-rooted: `package.json` is directly inside the extracted folder. Run `npm run doctor` before installation to confirm PowerShell is in the correct directory. See `START_HERE_WINDOWS.md`.

## Product architecture

```text
R3F / Three.js
  physical environments, devices, lighting, camera, transitions, artifacts

React DOM / embedded applications
  television channels, game, Kevin Online, K-Mail, Xanga, KevinBook, KevTok,
  agent evidence, Kevin Echo interpreter, resume, case studies, contact

Canonical content
  one verified profile, experience, capability, and project source
```

The six technology years are:

- 1990 — KevinVision
- 2000 — Kevin Online
- 2010 — KevinBook
- 2020 — KevTok
- 2030 — Kevin Nexus
- 2040 — Kevin Echo

## Current release status

V7.1 implements the R3F-first architecture as a connected physical timeline and a functional six-era vertical slice:

- one persistent R3F canvas across `/experience`
- six connected physical era environments with walls, floors, lighting, props, and authored environmental cameras
- authored camera and transition system, including a physically connected 2030/2040 future wing
- environment and focused-interface modes
- five cross-era artifacts
- WebGL, reduced-motion, Lite, and text fallbacks
- semantic direct portfolio routes
- static deployment output
- preserved functional V6 era applications inside the new world

The next bespoke GLB and texture pass, original environmental soundscape, render-to-texture portals, confirmed résumé chronology, and secure open-ended AI backend remain production follow-up work. The current release replaces the black-void display stands with inhabitable era dioramas and establishes the art-direction standard for future asset production. See `docs/IMPLEMENTATION_STATUS_V7.md`.

## Run locally

Node.js 20.9 or newer is required.

```powershell
npm install
npm run verify
npm run dev
```

The dev command automatically selects the next open port if 4321 is already occupied.

Build and preview the static export:

```powershell
npm run build
npm run preview
```

The deployable output is `out/`.

## Optional browser runtime pass

Start the preview server, then run this in a second terminal:

```powershell
$env:BASE_URL = "http://127.0.0.1:4321"
npm run test:runtime
```

Set `CHROME_PATH` when Chrome, Chromium, or Edge is installed outside a common location.

## Key routes

```text
/experience/
/experience/1990/
/experience/2000/
/experience/2010/
/experience/2020/
/experience/2030/
/experience/2040/
/portfolio/
/work/
/resume/
/about/
/contact/
```

## Quality modes

- High — shadows and postprocessing
- Standard — default balanced rendering
- Lite — reduced pixel ratio and effects
- Text — complete non-WebGL experience

## Embedded application layer

The functional V6 applications are preserved under `public/legacy/` and embedded into focused interface mode. They are same-origin, locally hosted, and patched to communicate internal navigation to the R3F parent shell.

## Verification

```powershell
npm run verify
```

This runs TypeScript, unit tests, production export, route checks, local-link validation, and security-configuration checks.

See:

- `docs/VERIFICATION_REPORT_V7.md`
- `docs/KNOWN_LIMITATIONS_V7.md`
- `docs/DEPLOYMENT_V7.md`

## Product documentation

The complete goal, PRD, technical specification, cross-timeline interaction rules, storyboard, and page acceptance index are under `docs/`.
