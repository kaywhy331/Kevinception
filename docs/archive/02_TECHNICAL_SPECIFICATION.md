# 02 — Technical Specification

**Architecture decision:** Next.js App Router + React + TypeScript + React Three Fiber  
**Rendering model:** Persistent R3F canvas for immersive routes; semantic DOM for applications and canonical pages  
**State:** XState for experience/transition state; Zustand for persistent UI/progress state  
**Animation:** GSAP for authored choreography; Three.js animation system for model clips  
**Validation:** Zod  
**Testing:** Vitest, Playwright, axe-core  
**Optional backend:** serverless route handlers/functions for grounded guide, contact, and telemetry

---

## 1. Architecture decision

Kevinception V7 is an **R3F-first hybrid**, not a WebGL-only application.

### R3F owns

- Environment geometry.
- Physical devices.
- Camera and focus.
- Lighting and shadows.
- Spatial sound positioning.
- Transitions.
- Cross-era physical artifacts.
- Hologram and agent visualizations.
- Screen effects and environmental reactions.

### React DOM owns

- Text and long-form content.
- AOL-style applications and window content.
- K-Mail and chat inputs.
- Xanga.
- KevinBook.
- KevTok captions, transcripts, comments, and controls.
- Mission evidence panels.
- Kevin Echo transcript and source links.
- Resume, project pages, and forms.
- Accessibility controls and scene map.

### Server-rendered/static routes own

- Metadata.
- Canonical content.
- Search visibility.
- Social previews.
- Structured data.
- No-JavaScript fallback.
- Print layouts.

The visitor experiences one continuous 3D site, but the implementation uses the browser’s native strengths for readable applications.

---

## 2. Platform stack

Recommended:

```text
Next.js App Router
React
TypeScript
three
@react-three/fiber
@react-three/drei
@react-three/postprocessing
xstate
zustand
gsap
zod
Phaser 3 or an isolated 2D canvas engine for the 1990 game
Vitest
Playwright
axe-core
```

Rationale:

- App Router layouts can preserve the experience shell while year routes change.
- Client-only 3D code can be dynamically imported.
- Canonical routes can be server-rendered or statically generated.
- R3F can use on-demand rendering for mostly static scenes.
- Three.js resources must be deliberately disposed as scenes unload.
- The stack supports a future dynamic AI endpoint without exposing provider keys.

---

## 3. Route structure

```text
app/
  layout.tsx
  page.tsx

  experience/
    layout.tsx
    page.tsx
    [year]/
      page.tsx
      loading.tsx
      error.tsx

  portfolio/
    page.tsx

  work/
    page.tsx
    [slug]/
      page.tsx

  resume/
    page.tsx

  about/
    page.tsx

  contact/
    page.tsx

  settings/
    page.tsx

  accessibility/
    page.tsx

  api/
    guide/
      route.ts
    contact/
      route.ts
    events/
      route.ts
```

`/experience/layout.tsx` mounts the persistent experience client boundary. The canvas must not be recreated on every year navigation.

---

## 4. Runtime composition

```tsx
<ExperienceLayout>
  <SemanticEraSummary />
  <ExperienceClient>
    <ExperienceCanvas>
      <QualityManager />
      <CameraDirector />
      <SceneManager />
      <TransitionDirector />
      <ArtifactDirector />
      <AudioDirector />
    </ExperienceCanvas>

    <InterfaceLayer />
    <GlobalUtilityLayer />
    <AccessibleSceneMap />
  </ExperienceClient>
</ExperienceLayout>
```

### 4.1 SemanticEraSummary

Server-rendered content containing:

- Year and title.
- Era purpose.
- Main content links.
- Fallback navigation.
- Metadata and structured data.

It may be visually minimized when WebGL is active but cannot be omitted.

### 4.2 ExperienceClient

Client-only boundary for browser APIs, R3F, state, sound, and interactions.

### 4.3 InterfaceLayer

A normal DOM layer aligned to or visually integrated with 3D device screens. When focused, it expands to a readable viewport-dominant mode.

---

## 5. State architecture

### 5.1 XState experience machine

```text
BOOTSTRAP
  → THRESHOLD
  → TIMELINE
  → ERA_LOADING
  → ENVIRONMENT
  → INTERFACE
  → TRANSITION
  → ENVIRONMENT
  → FALLBACK
  → ERROR
```

Parallel state regions:

```text
Audio: locked | muted | enabled
Motion: full | reduced | minimal
Quality: auto | high | standard | lite
Network: online | degraded | offline
Guide: idle | retrieving | responding | unavailable
```

Core events:

```text
ENTER_TIMELINE
SELECT_YEAR
SCENE_READY
ACTIVATE_DEVICE
ENTER_INTERFACE
STEP_BACK
OPEN_APP
OPEN_PROJECT
START_TRANSITION
TRANSITION_COMPLETE
SET_QUALITY
SET_MOTION
ENABLE_AUDIO
DISCOVER_ARTIFACT
RESET_PROGRESS
WEBGL_FAILED
```

### 5.2 Zustand persistent store

Persist:

```ts
type PersistentExperienceState = {
  lastYear?: EraYear;
  completedYears: EraYear[];
  eraProgress: Record<EraYear, EraProgress>;
  artifacts: Record<ArtifactId, ArtifactState>;
  settings: {
    sound: "muted" | "enabled";
    motion: "full" | "reduced" | "minimal";
    quality: "auto" | "high" | "standard" | "lite";
    captions: boolean;
  };
  interfaceState: {
    xangaSkin?: string;
    mailState?: MailState;
    kevinBookInteractions?: SocialState;
    kevTokState?: FeedState;
  };
};
```

Do not persist contact content or AI chat unless the visitor explicitly chooses to save a local session.

---

## 6. Canonical content contracts

### 6.1 Profile

```ts
type Profile = {
  id: "kevin";
  publicName: string;
  headline: string;
  shortBio: string;
  mediumBio: string;
  longBio: string;
  currentFocus: string[];
  philosophy: string[];
  contact: ContactConfig;
  trust: TrustMetadata;
};
```

### 6.2 Experience

```ts
type ExperienceEntry = {
  id: string;
  organization?: string;
  publicTitle: string;
  startDate?: string;
  endDate?: string;
  summary: string;
  responsibilities: string[];
  accomplishments: EvidenceStatement[];
  relatedProjectIds: string[];
  trust: TrustMetadata;
};
```

### 6.3 Project

```ts
type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  problem: string;
  context: string;
  role: string;
  collaborators?: string[];
  constraints: string[];
  decisions: DecisionRecord[];
  approach: string[];
  deliverables: string[];
  outcomes: EvidenceStatement[];
  artifacts: MediaArtifact[];
  learnings: string[];
  links: ProjectLink[];
  eraAdapters: Partial<Record<EraYear, EraPresentation>>;
  trust: TrustMetadata;
};
```

### 6.4 Trust metadata

```ts
type TrustStatus =
  | "confirmed"
  | "evidence-safe-synthesis"
  | "creative-context"
  | "speculative-projection"
  | "pending-confirmation"
  | "private";

type TrustMetadata = {
  status: TrustStatus;
  sourceIds: string[];
  approvedForPublic: boolean;
};
```

Build fails when a public factual surface includes `pending-confirmation` or `private`.

---

## 7. Era scene contract

```ts
type EraYear = 1990 | 2000 | 2010 | 2020 | 2030 | 2040;

type EraSceneManifest = {
  year: EraYear;
  id: string;
  title: string;

  scene: () => Promise<React.ComponentType>;
  interface: () => Promise<React.ComponentType>;

  camera: {
    establishing: CameraPose;
    environment: CameraPose;
    interface: CameraPose;
    exit: CameraPose;
  };

  device: {
    modelUrl: string;
    screenAnchor: string;
    hotspots: HotspotDefinition[];
  };

  transitions: {
    previous?: TransitionId;
    next?: TransitionId;
  };

  assets: {
    critical: AssetRef[];
    high: AssetRef[];
    standard: AssetRef[];
    lite: AssetRef[];
  };

  accessibility: {
    summary: string;
    semanticActions: SemanticAction[];
  };
};
```

Only current era is mounted. Adjacent era assets may be preloaded, but not its full scene graph.

---

## 8. Hotspot contract

```ts
type HotspotAction =
  | { type: "ACTIVATE_DEVICE" }
  | { type: "ENTER_INTERFACE"; interfaceId: string }
  | { type: "OPEN_APP"; appId: string }
  | { type: "CHANNEL"; value: number }
  | { type: "GAME_INPUT"; control: string }
  | { type: "OPEN_PROJECT"; projectId: string }
  | { type: "DISCOVER_ARTIFACT"; artifactId: string }
  | { type: "SELECT_MEMORY"; memoryId: string }
  | { type: "SELECT_AGENT"; agentId: string }
  | { type: "START_TRANSITION"; transitionId: string };

type HotspotDefinition = {
  id: string;
  objectName: string;
  label: string;
  description: string;
  action: HotspotAction;
  keyboardShortcut?: string;
  focusOrder: number;
  touchTargetScale?: number;
  availableInLiteMode: boolean;
};
```

Every hotspot must have:

- Visible focus/hover.
- Physical feedback.
- Semantic equivalent.
- Keyboard behavior.
- Touch behavior.
- Analytics event.
- Test ID.

---

## 9. Persistent canvas and scene lifecycle

### Mount policy

```text
Shared shell: always mounted
Current era: mounted
Next likely era: assets preloaded
Previous era: transition texture/cache only
Other eras: unloaded
```

### Lifecycle

```text
REQUEST_YEAR
→ LOAD_CRITICAL_ASSETS
→ SHOW_ERA_LOADING_LANGUAGE
→ MOUNT_SCENE
→ APPLY_SAVED_STATE
→ SCENE_READY
→ OPTIONAL_HIGH_QUALITY_STREAM
→ EXIT
→ DISPOSE_SCENE_RESOURCES
```

### Disposal requirements

On unmount:

- Remove scene objects.
- Stop animation mixers.
- Disconnect audio nodes.
- Revoke object URLs.
- Dispose geometries.
- Dispose materials.
- Dispose textures.
- Dispose render targets.
- Clear event listeners.
- Cancel timers and RAF loops.
- Release video decoders where practical.

A resource registry should track ownership per scene.

---

## 10. Rendering and quality tiers

### Auto detection inputs

- Device memory when available.
- Hardware concurrency.
- WebGL capabilities.
- Frame-time sample.
- Reduced-motion preference.
- Battery saver signals when available.
- Viewport and pixel density.

### High

- Full environment.
- Dynamic shadows where meaningful.
- Screen-portal render targets.
- Reflections and richer postprocessing.
- More particles.
- Higher texture/model detail.

### Standard

- Baked lighting.
- Limited shadows.
- Reduced postprocessing.
- Fewer particles.
- Standard models and textures.
- Simple portal transitions.

### Lite

- Static or lightly animated device.
- Minimal 3D environment.
- No expensive postprocessing.
- DOM interface dominant.
- Crossfade transitions.
- No continuous rendering except active game/video.

### Frameloop

Use `frameloop="demand"` where possible. Switch to active rendering during:

- Camera transitions.
- Game play.
- Video playback.
- CRT static.
- Agent animations.
- Hologram response.
- Particle transitions.

---

## 11. Camera system

No uncontrolled orbit or first-person camera in the primary experience.

Camera poses:

```ts
type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  duration?: number;
  easing?: string;
};
```

Rules:

- Authored poses per era.
- Pointer parallax is subtle and optional.
- Mobile uses fixed poses.
- Reduced motion uses cuts/crossfades.
- User input is locked only during brief transitions.
- Escape or Skip cancels nonessential cinematic motion.

---

## 12. Transition director

```ts
type TransitionDefinition = {
  id: TransitionId;
  from: EraYear;
  to: EraYear;
  preload: AssetRef[];
  exit: TransitionPhase[];
  bridge: TransitionPhase[];
  enter: TransitionPhase[];
  reducedMotionFallback: TransitionPhase[];
  timeoutMs: number;
};
```

State:

```text
PRELOAD
→ EXIT_CURRENT_INTERFACE
→ LOCK_NONESSENTIAL_INPUT
→ PLAY_EXIT
→ SWAP_SCENE
→ PLAY_ENTER
→ RESTORE_INPUT
→ COMPLETE
```

Transition time targets:

- Normal UI: 0.2–0.5 seconds.
- Enter/Step Back: 0.5–1.0 seconds.
- Year transition: 1.5–2.5 seconds.
- First-time establishing sequence: maximum four seconds unless skipped.

---

## 13. 1990 game integration

Recommended:

- Phaser 3 or isolated 2D engine.
- Dynamically imported only after console power.
- Render to a dedicated canvas.
- Use canvas as `CanvasTexture` on TV screen.
- DOM/touch controller and 3D controller dispatch to one input manager.

```text
Keyboard
Touch controller
3D controller hotspot
  → InputManager
  → Game engine
  → Canvas
  → CanvasTexture
  → TV screen
```

The game state remains independent from render-frame rate. The accessible text mode uses the same narrative/state schema.

---

## 14. DOM interfaces on devices

### Environmental mode

- DOM screen can be anchored to the device.
- Pointer events may be limited to large controls.
- Interface is not required to be fully readable at a distance.

### Interface mode

- Camera moves to screen.
- DOM UI expands to viewport-dominant layer.
- Physical bezel/environment remains visible as context.
- Focus is trapped only within true dialogs, not entire applications.
- Step Back returns to environment.
- URL/query state can update.

Do not render long text as Three.js text or textures.

---

## 15. Era-specific technical requirements

### 15.1 1990

- TV shader/effect component.
- Channel registry.
- Physical control state.
- Antenna/tracking parameters.
- Game input manager.
- Caption/transcript panel.
- Local save.
- Text-story fallback.

### 15.2 2000

- Window manager:
  - focus
  - z-index
  - drag
  - resize
  - minimize
  - maximize
  - restore
  - close
  - bounds recovery
  - session persistence
- Kevin Online state machine.
- Mail store.
- Buddy conversation store.
- Browser history.
- Xanga interaction store.
- AI guide adapter with deterministic fallback.

### 15.3 2010

- Social post registry.
- Tab router.
- Like/comment/status persistence.
- Search.
- Album viewer.
- Message drawer.
- Device notification bridge.

### 15.4 2020

- Finite clip manifest.
- Video/motion-card player.
- Caption and transcript registry.
- Swipe/keyboard controller.
- Like/save/comment state.
- Media preloading one clip ahead.
- Autoplay off by default unless muted and user-initiated.

### 15.5 2030

- Mission state machine.
- Agent graph.
- Evidence and source panel.
- Human gate state.
- Autonomy selector.
- Deterministic simulation baseline.
- Optional grounded guide endpoint.
- Projection disclosure.

### 15.6 2040

- Abstract hologram model/material.
- Memory-shard graph.
- Thought interpreter.
- Verified-vs-speculative response sections.
- Optional voice synthesis after permission.
- Static fallback.
- Identity disclosure always reachable.

---

## 16. AI guide architecture

### Request flow

```text
User message
→ deterministic command router
→ content retrieval
→ optional LLM generation
→ schema validation
→ source validation
→ action allowlist validation
→ response
```

### Reply contract

```ts
type GuideReply = {
  shortReply: string;
  expandedReply?: string;
  suggestedReplies: string[];
  sourceIds: string[];
  actions: GuideAction[];
  mode: "deterministic" | "generated" | "offline-fallback";
};

type GuideAction =
  | { type: "OPEN_PROJECT"; projectId: string }
  | { type: "OPEN_RESUME"; section?: string }
  | { type: "OPEN_APP"; appId: string }
  | { type: "OPEN_ARTIFACT"; artifactId: string }
  | { type: "HIGHLIGHT_CAPABILITY"; capabilityId: string }
  | { type: "SUGGEST_CONTACT"; intent: string }
  | { type: "UNLOCK_ARTIFACT_HINT"; artifactId: string };
```

Never return executable JavaScript, arbitrary URLs, or unvalidated selectors.

### Offline behavior

- Known commands continue.
- Manual navigation remains.
- In-character error appears.
- No fake answer is generated.

---

## 17. Asset pipeline

Formats:

- GLB for models.
- Meshopt/Draco when beneficial.
- KTX2/Basis for GPU textures.
- AVIF/WebP for images.
- MP4/WebM with poster and transcript for video.
- Original compressed audio with text alternatives.
- Sprite sheets for pixel game and lightweight particles.

Build checks:

- Model triangle budget.
- Texture dimensions.
- Texture memory estimate.
- Missing alt/transcript.
- Missing attribution/source status.
- Uncompressed duplicate assets.
- Proprietary-reference scan.
- Bundle and route asset budget.

---

## 18. Performance budgets

Recommended launch budgets:

### Canonical pages

- Initial JS: ≤ 120 KB compressed where practical.
- LCP target: ≤ 2.5 seconds at 75th percentile.
- CLS: ≤ 0.1.
- INP: ≤ 200 ms.

### Experience shell

- Semantic first paint: ≤ 2.0 seconds on target broadband/mobile hardware.
- Initial R3F shell and timeline: ≤ 1.5 MB compressed.
- Current era critical increment: target ≤ 2–3 MB.
- Adjacent preload: delayed until idle.
- 3D texture memory monitored by tier.
- Sustained frame target:
  - High/Standard desktop: 50–60 fps during motion.
  - Standard mobile: 30–60 fps.
  - Lite: stable interaction more important than frame rate.
- No unbounded memory growth after switching eras repeatedly.

Budgets may be refined after prototype measurement; CI must enforce agreed values.

---

## 19. Accessibility

- WCAG 2.2 AA target.
- Semantic first paint.
- All hotspots mirrored in accessible scene map.
- Keyboard order documented.
- No keyboard traps.
- Visible focus.
- Alternatives to dragging.
- Skip transitions.
- Reduced motion.
- Captions and transcripts.
- Audio never required.
- Touch targets appropriately sized.
- Canvas game text equivalent.
- No essential content hidden in 3D.
- Dialog focus management.
- Announce major state changes through restrained live regions.
- No flashing.
- Contrast tested per era.
- Screen-reader-friendly direct portfolio.

---

## 20. Mobile

Pattern:

```text
Establishing device reveal
→ tap/activate screen
→ interface expands nearly full screen
→ Step Back returns to 3D
```

Rules:

- Fixed authored camera.
- No device-tilt requirement.
- No hover-only actions.
- Controller uses large touch areas.
- AOL windows become full-screen app panels.
- KevinBook uses normal responsive feed.
- KevTok feels native.
- Agent evidence and Echo transcript use sheets/panels.
- Test portrait and landscape.
- Avoid viewport resize breakage from mobile browser chrome.

---

## 21. SEO and metadata

Canonical routes:

- Server-rendered/static HTML.
- Unique title and description.
- Canonical URL.
- Open Graph image.
- Structured data.
- Sitemap.
- Crawlable links.
- Project breadcrumbs.
- Person/ProfilePage/CreativeWork schemas where appropriate.

Immersive routes:

- Semantic summary.
- Year-specific metadata.
- Direct links to canonical projects.
- No essential content only in canvas.

---

## 22. Security and privacy

- API keys server-side only.
- Strict CSP compatible with Three.js assets.
- Validate all guide inputs and outputs.
- Sanitize user-generated local comments before rendering.
- Contact endpoint rate limiting and spam protection.
- Do not log contact message body in analytics.
- External links use safe targets and rel attributes.
- Avoid third-party trackers inside simulated interfaces.
- Asset origins allowlisted.
- Future voice/image data requires explicit approval.

---

## 23. Testing

### Unit

- Schemas.
- Reducers/stores.
- Transition definitions.
- Artifact transformations.
- Retrieval.
- Action validation.
- Era adapters.
- Game state.
- Mail/browser/social/feed state.

### Component

- Global controls.
- Interface mode.
- Focus behavior.
- Sign On.
- K-Mail.
- Xanga.
- KevinBook interactions.
- KevTok transcripts.
- Agent gate.
- Echo disclosure.

### E2E

- Threshold to timeline.
- Direct entry to every era.
- 1990 TV→game→2000.
- 2000 Sign On→Xanga→project.
- Recruiter path.
- Client project path.
- Mobile path.
- Reduced-motion path.
- Lite mode.
- WebGL failure.
- AI outage.
- Cross-era artifact propagation.
- Browser Back/Forward.
- Contact success/error.

### Performance

- Bundle budgets.
- Model/texture budgets.
- Frame-time sampling.
- Memory after repeated era switching.
- Scene disposal.
- Slow network.
- low-end device emulation.

### Visual regression

- Each era environment.
- Each interface mode.
- Mobile.
- Reduced motion.
- High/standard/lite.
- Major transition first/last frames.

---

## 24. CI gates

A pull request cannot merge unless:

- Type check passes.
- Lint passes.
- Unit tests pass.
- Required E2E subset passes.
- Accessibility scan passes.
- Content trust validation passes.
- Route/link validation passes.
- Asset/license scan passes.
- Bundle/asset budgets pass.
- No new console errors.
- Screenshot diffs approved.
- Owned-file boundaries respected.

---

## 25. Repository structure

```text
app/
  (canonical)/
    portfolio/
    work/
    resume/
    about/
    contact/

  experience/
    layout.tsx
    page.tsx
    [year]/
      page.tsx
      loading.tsx
      error.tsx

  api/
    guide/
    contact/
    events/

src/
  content/
    profile.ts
    experience.ts
    capabilities.ts
    projects/
    technologyMoments.ts
    eraMemories.ts
    artifacts.ts
    guideKnowledge.ts
    media.ts
    schemas/

  experience/
    ExperienceClient.tsx
    ExperienceCanvas.tsx
    ExperienceMachine.ts
    ExperienceStore.ts

    scenes/
      Timeline/
      Year1990/
      Year2000/
      Year2010/
      Year2020/
      Year2030/
      Year2040/

    devices/
      TubeTelevision/
      GameConsole/
      CRTComputer/
      Laptop/
      Smartphone/
      AgentCore/
      KevinHologram/

    interfaces/
      KevinVision/
      KevinOnline/
      KevinBook/
      KevTok/
      KevinNexus/
      KevinEcho/

    transitions/
      TransitionDirector.tsx
      StaticPortal.tsx
      ProfileTransform.tsx
      VideoRotate.tsx
      AgentMerge.tsx

    artifacts/
      ArtifactDirector.tsx
      artifactTransforms.ts

    camera/
      CameraDirector.tsx
      poses.ts
      paths.ts

    audio/
      AudioDirector.tsx
      soundManifest.ts

    performance/
      QualityManager.tsx
      ResourceRegistry.ts
      ScenePreloader.tsx

    accessibility/
      AccessibleSceneMap.tsx
      MotionFallback.tsx
      KeyboardNavigator.tsx

  components/
    portfolio/
    project/
    resume/
    contact/
    navigation/

tests/
  unit/
  component/
  e2e/
  accessibility/
  performance/
  visual/
```
