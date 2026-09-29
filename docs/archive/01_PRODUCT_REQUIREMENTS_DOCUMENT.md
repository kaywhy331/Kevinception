# 01 — Product Requirements Document

**Product:** Kevinception  
**Version:** V7 planning baseline  
**Product owner:** Kevin Yang  
**Primary architecture:** R3F-first hybrid  
**Primary domain:** kevinception.com  
**Status:** Implementation-ready product contract

---

## 1. Product definition

Kevinception is composed of two coordinated products:

### A. Direct Portfolio Mode

A fast, semantic, indexable portfolio for visitors who prioritize clarity and evidence.

Routes:

```text
/portfolio
/work
/work/[project-slug]
/resume
/about
/contact
```

### B. Kevinception Experience Mode

A persistent 3D technology timeline with six era routes:

```text
/experience
/experience/1990
/experience/2000
/experience/2010
/experience/2020
/experience/2030
/experience/2040
```

The same canonical content powers both modes.

---

## 2. Experience architecture

### 2.1 Global rhythm

Every era must support:

1. **Arrive** — establish year and physical technology.
2. **Activate** — power on, sign on, open, swipe, initiate, or transmit.
3. **Explore** — use the era-native interface.
4. **Understand Kevin** — access biography, capabilities, work, and philosophy.
5. **Discover** — optionally find an era reference or cross-era artifact.
6. **Continue** — next year, timeline, portfolio, or contact.

### 2.2 Experience modes

```text
THRESHOLD
TIMELINE
ENVIRONMENT
INTERFACE
TRANSITION
FALLBACK
```

- **Environment mode:** physical device and scene are primary.
- **Interface mode:** device UI becomes dominant and readable.
- **Transition mode:** route, scene, camera, audio, and artifact state coordinate.
- **Fallback mode:** semantic experience when WebGL is unavailable or disabled.

### 2.3 Persistent controls

The meaning and keyboard order remain consistent:

- Timeline
- Portfolio
- Previous year
- Next year
- Step Back
- Sound
- Motion
- Quality
- Help
- Contact Kevin

Visual treatment may change by era.

---

## 3. Information architecture

```text
/
├── /experience
│   ├── /experience/1990
│   ├── /experience/2000
│   ├── /experience/2010
│   ├── /experience/2020
│   ├── /experience/2030
│   └── /experience/2040
├── /portfolio
├── /work
│   └── /work/[project-slug]
├── /resume
├── /about
├── /contact
├── /settings
└── /accessibility
```

Optional shareable interface state may use query parameters:

```text
/experience/2000?app=xanga
/experience/2010?tab=projects
/experience/2020?clip=ai-agents
/experience/2030?mission=workflow-diagnosis
/experience/2040?memory=orchestration
```

A query parameter may open a state after the establishing shot, but must not create a duplicate canonical content source.

---

## 4. User journeys

### 4.1 Immersive explorer

```text
/ → /experience → 1990 → 2000 → 2010 → 2020 → 2030 → 2040 → /portfolio → /contact
```

Requirements:

- Can skip any era.
- Can exit at any time.
- Progress persists locally.
- Previously completed startup sequences may be skipped.
- Next era is suggested, never forced.

### 4.2 Recruiter

```text
/ → /portfolio → /resume → /work/[project] → /contact
```

Requirements:

- No 3D dependency.
- Clear positioning above the fold.
- Resume and selected work visible immediately.
- Print/download and contact function without account creation.

### 4.3 Prospective client

```text
/experience/2020 or /experience/2030
→ relevant project
→ case study
→ contact intent preselected
```

Requirements:

- Era applications can open canonical projects.
- Contact route can receive `?intent=` and `?project=` context.
- No claim is generated without source-backed content.

### 4.4 Technical evaluator

```text
/experience/1990
→ game
→ 2000 transition
→ Kevin Online
→ Kevinception case study
→ 2030 system
```

Requirements:

- Technical architecture is documented.
- Accessibility and performance modes are visible.
- Real interaction states—not only scripted videos—are demonstrable.

### 4.5 Returning visitor

Requirements:

- Detect saved progress.
- Offer Continue, Timeline, Portfolio, and Start Over.
- Never auto-start sound.
- Never force replay of a long introduction.
- Preserve settings independently from narrative progress.

---

## 5. Global functional requirements

### REQ-GLOBAL-001 — Immediate clarity

The threshold must communicate the concept and two primary paths before the 3D bundle finishes loading.

### REQ-GLOBAL-002 — Direct portfolio access

Portfolio, Work, Resume, and Contact are available from all eras.

### REQ-GLOBAL-003 — Persistent URL state

Each era has a direct route. Browser Back/Forward must behave predictably.

### REQ-GLOBAL-004 — Shared canonical content

All factual surfaces read from the same validated records.

### REQ-GLOBAL-005 — Progressive loading

Only the current scene, shared shell, transition assets, and likely adjacent scene are loaded.

### REQ-GLOBAL-006 — Environmental and interface modes

Each era can move between a physical-device view and a focused readable UI.

### REQ-GLOBAL-007 — Step Back

Every focused interface exposes a clear way to return to the device/environment.

### REQ-GLOBAL-008 — Returning sessions

Settings and progress persist locally; visitors can reset them.

### REQ-GLOBAL-009 — Sound permission

Audio begins only after deliberate user interaction. Sound state persists.

### REQ-GLOBAL-010 — Motion preference

System preference is respected. Visitors can choose Full, Reduced, or Minimal motion.

### REQ-GLOBAL-011 — Quality preference

Visitors can choose Auto, High, Standard, or Lite. Auto may adapt down but must not silently adapt up during a session.

### REQ-GLOBAL-012 — No-WebGL path

All content and core actions remain available without WebGL.

### REQ-GLOBAL-013 — Semantic navigation

All 3D hotspots have equivalent keyboard and assistive-technology controls.

### REQ-GLOBAL-014 — Cross-era state

Artifacts and discoveries can affect later presentation without altering factual content.

### REQ-GLOBAL-015 — Safe AI actions

AI may return only validated text, source references, and allowlisted actions.

### REQ-GLOBAL-016 — Essential content not gated

No resume, project, about, or contact content requires game completion, AI availability, sound, dragging, or Easter-egg discovery.

### REQ-GLOBAL-017 — Original production assets

Referenced products may inspire interaction patterns, but production branding, art, sound, code, characters, maps, music, and copy remain original.

---

## 6. Page requirements

# Page A — `/` — Threshold

## Purpose

Explain Kevinception in seconds and offer a choice between immersion and utility.

## Required content

- Kevinception wordmark.
- Headline: technology-life timeline positioning.
- Supporting line.
- Enter the Timeline.
- View Kevin’s Work.
- Resume, Selected Work, Contact.
- Sound, motion, and skip controls.
- Returning-visitor continuation when applicable.

## Primary interaction

Choose Timeline or Portfolio.

## R3F behavior

- Six year rings or device silhouettes emerge.
- Animation never blocks controls.
- Reduced motion uses a static composition.

## Acceptance requirements

- Primary buttons exist in initial semantic HTML.
- Timeline can be entered within one interaction.
- Portfolio can be entered without loading R3F.
- Returning visitor can continue or reset.

---

# Page B — `/experience` — Timeline

## Purpose

Provide direct, understandable access to all six years.

## Required content per station

- Year.
- Era name.
- Iconic device.
- One-sentence technology shift.
- One-sentence Kevin connection.
- Enter action.
- Completion/progress indicator.

## Primary interaction

Move between six authored stations and enter one.

## R3F behavior

- One selected device is fully lit.
- Camera movement is horizontal or along a restrained curve.
- No free-roaming locomotion.

## Acceptance requirements

- Every year is reachable by pointer, keyboard, swipe, and visible controls.
- Direct route changes on entry.
- Completed eras and artifacts are represented without clutter.
- Mobile uses swipe/cards or authored camera steps.

---

# Page C — `/experience/1990` — KevinVision

## Purpose

Represent wonder, play, physical controls, and the first realization that screens contain interactive worlds.

## Environment requirements

- Tube TV.
- Rabbit-ear antenna.
- TV stand.
- Original cartridge console.
- Wired controller.
- Period objects used sparingly.
- Screen glow affects nearby scene.

## Primary interaction loop

```text
Power TV → tune channels → discover Channel 3
→ power console → play The Circuit of Time
→ restore signal → continue to 2000
```

## Required channels

- Channel 2 — Technology Tonight.
- Channel 3 — Game input.
- Channel 4 — Kevin’s Curiosity Club.
- Channel 5 — Future Files / projects.
- Channel 7 — Home Video Timeline.
- Channel 9 — Public Access / Ask Kevin.
- Channel 13 — optional scrambled signal.

## Game requirements

- Original top-down 8-bit adventure.
- Three fragments: Curiosity, Systems, Invention.
- Five-to-ten-minute primary loop.
- Keyboard, touch, and on-page controller.
- Pause, reset, mute, local save.
- Text-based equivalent.
- No essential content gated by win.

## Easter-egg budget

Three to six meaningful, era-authentic interactions.

## Transition

TV static becomes modem noise; camera passes through screen into 2000.

---

# Page D — `/experience/2000` — Kevin Online

## Purpose

Represent early-internet connection, online identity, discovery, experimentation, and social presence.

## Environment requirements

- Beige CRT and tower.
- Keyboard and ball mouse.
- External modem.
- Speakers.
- Telephone line.
- Free-hours CDs.
- Desk-specific light and LED behavior.

## Primary interaction loop

```text
Boot → Sign On → Dial / Connect / Verify
→ Welcome → Mail / Buddies / Browser / Xanga
→ Projects / Resume → continue to 2010
```

## Sign On requirements

- Screen name.
- Password.
- Location.
- Save password.
- Dial-up sounds.
- Setup.
- Access Numbers.
- Help.
- Sign On.
- Guest identity prefilled.
- Accessible instant-connect option.

## Connection requirements

- Separate dialog.
- Dialing, Connecting, Verifying, Signing On, Connected.
- Progress and technical detail update.
- Cancel and retry.
- Sound opt-in.
- Screen name preserved.

## Kevin Online shell

- Era-appropriate menus.
- Toolbar.
- Keyword/address field.
- Status and connection timer.
- Welcome surface exposing:
  - About Kevin
  - Projects
  - Resume
  - Xanga
  - Buddy List

## K-Mail

- New, Old, Sent, Deleted.
- Read state.
- Compose, send, reply, forward, delete, restore.
- Local persistence.

## Buddy List / IM

- Minimum three distinct roles at launch target:
  - career/resume guide
  - technical/project guide
  - hidden cross-era guide
- Conversation remains open alongside projects.
- Manual navigation works when AI is unavailable.

## Kevin Explorer and Xanga

- Back, Forward, Home, Refresh, Favorites, Address.
- Xanga reachable from multiple visible paths and accepted keywords/URLs.
- Xanga supports posts, eProps, comments, subscriptions, Sites I Read, blogrings, search, skins, and protected future entry.

## Transition

Xanga/profile media expands and resolves into KevinBook.

---

# Page E — `/experience/2010` — KevinBook

## Purpose

Represent digital identity, social connection, public participation, and the increasingly visible relationship between personal interests and professional direction.

## Environment requirements

- Laptop or flat display.
- Early smartphone.
- Digital camera.
- Notification-driven ambient response.

## Primary interaction loop

```text
Open profile → review Wall / About / Projects
→ like, comment, message, or explore media
→ open a project or video → continue to 2020
```

## Required tabs

- Wall.
- About.
- Projects.
- Photos.
- Notes.

## Required functions

- Publish local visitor status.
- Like and comment.
- Search.
- Messages.
- Poke.
- Friend request.
- One era-appropriate application-request joke.
- Persistent local interaction state.

## Content requirements

- Verified milestones.
- Technology moments.
- Project launches.
- Long-form Notes.
- Albums and behind-the-scenes media.
- Clear About summary and contact.

## Transition

A selected video expands and rotates from landscape into a portrait phone.

---

# Page F — `/experience/2020` — KevTok

## Purpose

Represent compressed communication, personal brand, creative distribution, project storytelling, and the modern velocity of technology.

## Environment requirements

- Smartphone.
- Ring light.
- Microphone.
- Editing workstation.
- Minimal reaction particles.

## Primary interaction loop

```text
Enter finite feed → watch / read clips
→ react or open transcript
→ open project / follow topic
→ reach final CTA → continue to 2030
```

## Feed requirements

- Finite authored series; recommended eight clips.
- Clear progress.
- Vertical scroll-snap.
- Keyboard and swipe.
- No infinite feed.
- Captions and transcript for every clip.
- Pause and playback control.
- Like, save, comment, share.
- Topic filters.
- Direct full-story/project actions.

## Suggested sequence

1. Who is Kevin?
2. What problems does Kevin solve?
3. Kevinception.
4. Systems and automation.
5. Product and experience thinking.
6. AI and agents.
7. How Kevin works.
8. What are you trying to build?

## Transition

Captions, reactions, and comments separate into 2030 agent nodes.

---

# Page G — `/experience/2030` — Kevin Nexus

## Purpose

Present a plausible near-future model of human collaboration with autonomous agents, grounded in Kevin’s current systems and AI work.

## Required labeling

- Projection / scenario.
- Assumptions.
- Current evidence sources.
- Human decision boundaries.

## Primary interaction loop

```text
Choose objective → initialize agents
→ inspect plan and evidence
→ observe handoffs/disagreement
→ approve, revise, or reject
→ continue to 2040
```

## Required agent roles

- Clarifier.
- Researcher.
- Architect.
- Builder.
- Governor.

## Required functions

- Mission presets and custom objective.
- Autonomy selector.
- Shared memory representation.
- Task decomposition.
- Evidence log and source references.
- Uncertainty/confidence display.
- Human approval gate.
- Ask Why.
- Approve, Revise, Reject.
- Project links explaining current foundations.

## Transition

Agent memories converge into a human-shaped field.

---

# Page H — `/experience/2040` — Kevin Echo

## Purpose

Present a speculative digital representation of Kevin’s public knowledge, authored memories, projects, and values.

## Required disclosure

Kevin Echo is a speculative representation. It is not transferred consciousness and not the biological Kevin.

## Primary interaction loop

```text
Choose or type a thought → transmit signal
→ retrieve verified memories and projects
→ receive concise response
→ expand or open evidence
→ conclude in present-day portfolio
```

## Required memory constellations

- Wonder.
- Connection.
- Identity.
- Creation.
- Orchestration.
- Continuity.

## Required functions

- Thought prompt chips.
- Free-text interpreter.
- Concise and expanded response.
- Project/evidence actions.
- Memory-shard navigation.
- Source-integrity explanation.
- Optional voice after permission.
- Text transcript.
- Static/no-WebGL representation.

## Closing actions

- View Kevin’s Work.
- Contact the biological Kevin.
- Return to 1990.
- Timeline.
- Review collected artifacts.

---

# Page I — `/portfolio`

## Purpose

Provide the fastest complete understanding of Kevin.

## Required sections

1. Positioning hero.
2. Selected work.
3. Capability system.
4. Experience snapshot.
5. How Kevin works.
6. Technology timeline summary.
7. Contact CTA.

## Requirements

- No 3D dependency.
- Selected projects above the fold or immediately below.
- Resume and contact visible.
- Content reads from canonical records.
- Timeline link clearly offers the immersive alternative.

---

# Page J — `/work`

## Purpose

Help visitors find relevant evidence.

## Requirements

- Search.
- Filters by capability, problem type, discipline, status, and technology.
- Cards with problem, role, result/evidence, and relevant tags.
- Canonical URLs.
- Empty-state guidance.
- Clear contact pathway.

---

# Page K — `/work/[project-slug]`

## Required structure

1. Executive summary.
2. Problem/opportunity.
3. Context and constraints.
4. Kevin’s role.
5. Collaborators where approved.
6. Approach.
7. Key decisions.
8. System/workflow.
9. Execution.
10. Outcomes and evidence.
11. Artifacts.
12. Learnings.
13. Next opportunity.
14. Related work.
15. Contact.

## Requirements

- Factual claims are source-backed.
- Unsupported metrics are not published.
- Era applications can deep-link to the canonical project.
- Print and sharing metadata work.

---

# Page L — `/resume`

## Requirements

- Quick view.
- Full chronology.
- Capabilities.
- Selected projects.
- Print/download.
- Contact.
- No invented employer/title/date data.
- Resume remains readable without JavaScript.

---

# Page M — `/about`

## Requirements

- Personal introduction.
- Technology origin story.
- How Kevin thinks.
- Problems that energize him.
- Collaboration philosophy.
- Current focus.
- Six-era summary.
- Contact CTA.

---

# Page N — `/contact`

## Requirements

- Intent selector:
  - Consulting/advisory
  - Product/project leadership
  - Systems/automation
  - AI/agent workflows
  - Collaboration/partnership
  - Speaking/creative work
  - Other
- Name, email, message.
- Optional project context.
- Validation.
- Privacy copy.
- Success and error states.
- Accessible non-JavaScript fallback or mail route.
- No fake scheduling integration.

---

## 7. Content requirements

Canonical records must include:

- Profile.
- Positioning.
- Biography variants.
- Experience.
- Capabilities.
- Projects.
- Evidence and outcomes.
- Media/artifacts.
- Technology moments.
- Era-specific memories.
- FAQ/interview answers.
- Contact.
- Future projections.
- Cross-era artifacts.

Trust states:

```text
confirmed
evidence-safe synthesis
creative context
speculative projection
pending confirmation
private
```

Publication rules:

- `pending confirmation` and `private` never publish as facts.
- `speculative projection` is labeled in 2030/2040.
- `creative context` cannot appear in resume or case-study outcomes.
- AI receives only approved public records.

---

## 8. Analytics requirements

Events:

```text
entry_mode_selected
timeline_year_selected
environment_activated
interface_entered
step_back
era_completed
era_skipped
project_opened
project_depth_reached
resume_viewed
resume_downloaded
contact_started
contact_completed
artifact_discovered
transition_completed
quality_changed
motion_changed
sound_changed
webgl_fallback_used
experience_error
web_vital_recorded
```

Do not record private chat content or contact-message bodies in analytics.

---

## 9. Release scope

### V7.0 launch scope

- Threshold and timeline.
- Complete 1990→2000 vertical slice at high polish.
- Functional shells for 2010, 2020, 2030, 2040.
- Canonical portfolio routes.
- Cross-era state foundation.
- Quality, motion, sound, mobile, fallback, and accessibility systems.
- At least three real case studies.
- Content truth validation.

### Post-launch depth

- Expanded 3D detail.
- More authored media.
- Grounded AI buddies.
- Kevin Echo voice/likeness only after approval.
- Additional artifacts and hidden narrative.
- Authoring tools.

---

## 10. Product risks

| Risk | Mitigation |
|---|---|
| 3D overwhelms content | interface mode and direct portfolio |
| Slow initial load | semantic first paint, dynamic canvas, route-scoped scenes |
| Six worlds become six codebases | shared contracts and persistent shell |
| Mobile becomes unusable | device reveal then full-screen interface |
| Nostalgia becomes imitation | original assets and brand language |
| Future content sounds factual | explicit projection labels |
| AI invents facts | retrieval, source IDs, allowlisted actions, deterministic fallback |
| Game scope expands | fixed five-to-ten-minute loop |
| Visitors get lost | persistent controls, authored camera, no free-roam |
| GPU memory leaks | scene lifecycle and resource disposal |
