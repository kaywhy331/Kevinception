# Kevinception — Storyboard and user journeys

**Product direction:** R3F-first hybrid experience  
**Timeline:** 1990 → 2000 → 2010 → 2020 → 2030 → 2040  
**Purpose:** Define every primary route, cinematic scene, interaction loop, transition, content reveal, mobile adaptation, and user journey.  
**Status:** Design intent, originally written for the V7 planning baseline (2026-07-20). Pages 5, 7, and 8 were rewritten for 0.9.0 to match the shipped chapters (StealStreet Commerce OS, Morning, Together, Morning, After). Elsewhere, where this storyboard and the product differ, `NARRATIVE.md` and the code win. The standalone Profile page (`/portfolio`) has since merged into About.

---

## 1. Experience thesis

Kevinception is a technology-life timeline experienced through the dominant interface of each era.

The visitor does not browse six themed webpages. They move through six connected technology environments that show how curiosity, connection, identity, creation, orchestration, and preserved perspective shaped Kevin over time.

The narrative progression is:

| Year | Interface | Narrative role | Emotional target |
|---:|---|---|---|
| 1990 | Tube television and 8-bit console | Technology feels magical | Wonder and play |
| 2000 | Kevin Online and the early web | Technology becomes a world to explore | Connection and discovery |
| 2010 | StealStreet Commerce OS (Commerce) | Technology becomes operations at scale | Competence and systems ownership |
| 2020 | KevTok short-form feed (Creation) | Technology becomes compressed creativity and distribution | Velocity and signal |
| 2030 | Morning, Together (Co-Existence) | Technology becomes a household intelligence that notices, stages, and waits for consent | Trust, restraint, and ordinary warmth |
| 2040 | Morning, After (Consciousness) | Technology becomes a permissioned memory of a person | Reflection and a slight uncanniness |

The central story is:

> A child fascinated by screens and game systems becomes an explorer of the internet, a builder of commerce systems, a creator, someone who lives alongside a household intelligence that asks before it keeps anything, and eventually a holographic reproduction that can only remember what was allowed.

---

## 2. Route and scene map

```text
/
├── Start the experience → /experience
├── View Kevin's work    → /work
└── Resume / Contact shortcuts

/experience
├── /experience/1990
├── /experience/2000
├── /experience/2010
├── /experience/2020
├── /experience/2030
└── /experience/2040

/work
│   └── /work/[project-slug]
/resume
/about        (includes the former /portfolio Profile; /portfolio redirects here)
/contact
```

The immersive routes use one persistent React Three Fiber canvas. The URL changes as the camera moves between eras, but the visitor experiences one continuous world.

Canonical portfolio routes remain normal semantic pages and are always available without entering the 3D experience.

---

## 3. Global experience rules

### 3.1 One interaction model across all eras

Every era follows the same six-step rhythm:

1. **Arrive** — establish the physical technology and the year.
2. **Activate** — turn on, sign on, open, swipe, initiate, or transmit.
3. **Explore** — interact through the interface native to that era.
4. **Understand Kevin** — receive biography, project, capability, and philosophy content.
5. **Discover** — find one optional reference, artifact, or Easter egg.
6. **Continue** — move to the next year, return to the timeline, or enter Portfolio Mode.

### 3.2 Persistent controls

A restrained utility layer remains available in every era:

- **Timeline** — step back to the six-year overview.
- **Portfolio** — leave the immersive route for the direct portfolio.
- **Previous / Next year** — move chronologically.
- **Step Back** — exit focused interface mode and return to the physical environment.
- **Sound** — on/off and volume.
- **Motion** — full/reduced.
- **Quality** — high/standard/lite when needed.
- **Help** — controls and accessibility map.
- **Contact Kevin** — always reachable.

These controls may change visual treatment by era, but their location and meaning remain predictable.

### 3.3 Environmental mode and interface mode

Each era has two visual states.

**Environmental mode** shows the physical device and surrounding world. The visitor interacts with power buttons, antennae, cartridges, keyboards, screens, phones, nodes, or memory shards.

**Interface mode** focuses the camera on the device and allows the HTML application to dominate the viewport. Text, forms, feeds, mail, chat, and case studies remain sharp and accessible.

The visitor can always select **Step Back** to return to environmental mode.

### 3.4 Loading behavior

Loading is expressed through the current era rather than a generic spinner:

- 1990 — television static or “Please Stand By.”
- 2000 — connecting or downloading.
- 2010 — profile loading skeleton.
- 2020 — buffering ring.
- 2030 — agent initialization.
- 2040 — signal reconstruction.

The next likely era is preloaded while the visitor explores the current one.

### 3.5 Direct entry

A visitor opening `/experience/2000` directly should not be forced through 1990.

Direct-entry sequence:

1. Short establishing shot of the year-2000 desk.
2. Kevin Online Sign On opens.
3. A small “Start from 1990” option remains available.

Returning visitors may choose:

- Resume last session.
- Start at the timeline.
- Restart the full experience.

---

# 4. Page-by-page storyboard

---

## Page 1 — `/` — The Threshold

### Purpose

Explain the concept in seconds, give a clear choice between immersive exploration and practical portfolio review, and establish the Kevinception identity without making the visitor wait.

### Target duration

- First visit: 6–12 seconds before the first decision.
- Returning visit: immediate options.

### Storyboard

#### Frame 0 — Accessible first paint

- Background is nearly black.
- The Kevinception wordmark is visible as real HTML.
- Primary actions already exist in the DOM:
  - **Enter the Timeline**
  - **View Kevin’s Work**
- Skip, sound, and reduced-motion controls are immediately available.

This frame ensures the site is usable before the 3D scene finishes loading.

#### Frame 1 — The mark appears

- A small point of light divides into six concentric rings.
- Each ring briefly carries a year: 1990, 2000, 2010, 2020, 2030, 2040.
- The rings align into the Kevinception symbol.

Suggested headline:

> Technology changes. Curiosity compounds.

Supporting line:

> Explore the interfaces, ideas, and moments that shaped Kevin.

#### Frame 2 — Six objects emerge

Silhouettes appear in sequence:

1. Tube television.
2. Beige CRT computer.
3. Laptop/social profile.
4. Smartphone.
5. AI memory core.
6. Holographic figure.

They remain subtle. The page should not explain every era before the visitor asks.

#### Frame 3 — The decision

Two primary buttons become prominent:

- **Enter the Timeline** — immersive route.
- **View Portfolio** — fast, conventional route.

Secondary links:

- Resume
- Selected Work
- Contact

#### Frame 4 — Visitor action

**Enter the Timeline** causes the Kevinception rings to separate into a path and the camera moves through them into `/experience`.

**View Portfolio** transitions directly to the portfolio hero with no cinematic delay.

### Returning visitor variation

The page recognizes local progress and displays:

> Continue from 2010 — StealStreet Commerce OS

Actions:

- Continue
- Timeline
- Start over
- Portfolio

### Mobile adaptation

- No large free-camera scene.
- The six device silhouettes form a swipeable horizontal strip.
- Buttons remain above the fold.

### Reduced-motion adaptation

- Rings fade rather than fly forward.
- Device silhouettes crossfade.
- No camera tunnel.

---

## Page 2 — `/experience` — The Technology Timeline

### Purpose

Let visitors understand the complete structure and choose any year without navigating a 3D maze.

### Core design

A dark linear memory gallery. One iconic device is highlighted at a time. The visitor scrolls, swipes, uses arrow keys, or presses visible previous/next controls.

There is no first-person walking.

### Storyboard

#### Frame 1 — Establishing view

The camera reveals six stations arranged along one continuous line.

A thin light path connects them. Each station is mostly dark until selected.

#### Frame 2 — 1990 focus

The tube television lights up.

Text panel:

> **1990 — KevinVision**  
> Technology feels like magic. Games, channels, buttons, and signals teach that an interface can open another world.

Actions:

- Enter 1990
- Preview
- Skip to another year

#### Frame 3 — Timeline browsing

As the visitor moves between years:

- The camera shifts a controlled distance.
- The selected device powers on briefly.
- A one-sentence “What changed for Kevin” statement appears.
- Progress and unlocked artifacts are shown subtly.

Era statements:

- **1990:** Curiosity becomes exploration.
- **2000:** Exploration becomes experimentation.
- **2010:** Experimentation becomes digital identity and connection.
- **2020:** Identity becomes creation, systems, and distribution.
- **2030:** Systems become delegated intelligence.
- **2040:** Intelligence becomes preserved perspective.

#### Frame 4 — Selection

Selecting a year moves the camera toward the object and changes the route.

### Timeline utility functions

- Resume last year.
- See collected artifacts.
- Reset progress.
- Enter direct portfolio.
- View year descriptions without entering scenes.

### Mobile adaptation

Each year is a large snap card with a lightweight 3D object or optimized video loop. One full year card is visible at a time.

---

## Page 3 — `/experience/1990` — KevinVision

### Purpose

Show the earliest layer of Kevin’s technology curiosity through the most recognizable home interface of the era: a tube television and game console.

### Emotional target

Wonder, play, control, and the feeling that another world exists behind the glass.

### Environment

A focused family-room vignette:

- Tube television with rabbit-ear antenna.
- Wooden or laminate television stand.
- Cartridge game console.
- Wired controller.
- VHS tapes and game cartridges.
- Low room light.
- Television glow illuminating nearby objects.

The television remains the center of attention. The room is suggestive, not cluttered.

### Entry storyboard

#### Frame 1 — Dark room

The television and console are off.

A small prompt appears:

> Turn on the television.

The physical power button is highlighted. An equivalent HTML button is available for keyboard and assistive use.

#### Frame 2 — Power-on

- Mechanical click.
- White point expands vertically and horizontally.
- Static appears.
- The channel indicator reads `02`.
- Room lighting reacts to the screen.

#### Frame 3 — First program

Channel 2 stabilizes on a technology-news broadcast.

A host or title card introduces the year:

> This is 1990. Screens are becoming portals, games are becoming worlds, and Kevin is paying attention.

A small overlay teaches:

- Channel up/down
- Volume
- Tracking
- Antenna
- Channel 3 game input

The tutorial can be dismissed permanently.

### Channel storyboard

#### Channel 2 — Technology Tonight

**Function:** Era context.

Content is presented like short television segments:

- Home technology becoming interactive.
- Video games teaching rules, systems, maps, and persistence.
- Physical media and scheduled programming shaping attention.
- The difference between watching a screen and controlling one.

Each segment lasts 15–30 seconds and can be paused or read as a transcript.

#### Channel 3 — Game Input

**Function:** Playable 8-bit game.

When the console is off:

- Blue or black input screen.
- `NO SIGNAL — CHECK GAME CONSOLE`.

When the console is turned on:

- Cartridge title animation.
- The Circuit of Time starts.

#### Channel 4 — Kevin’s Curiosity Club

**Function:** Kevin’s early origin story.

Presented like a children’s public-television program or local educational segment.

Topics:

- Fascination with buttons, menus, electronics, and cause-and-effect.
- Curiosity about how systems work beneath the surface.
- Early attraction to games and interactive technology.
- The beginning of a lifelong pattern: explore, understand, improve.

Only confirmed personal details should be used. Unconfirmed anecdotes appear as editable content placeholders, not assertions.

#### Channel 5 — Future Files

**Function:** Foreshadow current projects.

The broadcast is unstable. Modern work appears as strange transmissions from the future:

- Kevinception
- Automation and workflow systems
- AI and agent orchestration
- Product and operating-system thinking

Each transmission is visually degraded and labeled as a future signal. Selecting one opens a concise project preview without leaving the television.

#### Channel 7 — Home Video Timeline

**Function:** Biography and milestones.

Presented as a VHS home-video compilation:

- Technology influences
- Learning moments
- Building moments
- Career and project milestones

The tape can rewind, fast-forward, pause, and display chapters.

#### Channel 9 — Public Access: Ask Kevin

**Function:** Capabilities, philosophy, and practical navigation.

The visitor can choose common questions:

- What does Kevin do?
- What kind of problems does he solve?
- Show me a project.
- How does he approach ambiguous work?
- How can I contact him?

Answers appear as a deliberately low-budget public-access call-in program. The same answers are available as accessible text.

#### Channel 13 — Scrambled Signal

**Function:** Easter eggs and cross-era continuity.

Most of the signal is scrambled. Adjusting the antenna or tracking may reveal:

- A screen name from 2000.
- A StealStreet order notification.
- A vertical-video fragment.
- An agent identifier.
- A holographic memory code.

This channel must remain optional and never contain essential portfolio facts.

### Channel 3 game storyboard — The Circuit of Time

#### Game title screen

- Original 8-bit logo.
- Start, Continue, Controls, Accessible Story Mode.
- Console-style attract loop.

#### Narrative setup

A signal connecting multiple times has broken into three fragments:

- Curiosity
- Systems
- Invention

The player must explore a compact world and restore the signal.

#### Game areas

1. **The Home Field** — teaches movement and interaction.
2. **The Pattern Woods** — simple switch and path puzzle.
3. **The Circuit Cavern** — timing and systems puzzle.
4. **The Signal Tower** — opens after the three fragments are collected.

#### Gameplay

- Top-down movement.
- Simple action and secondary-action buttons.
- Light obstacles and optional enemies.
- No punishing game-over loop.
- Three collectible fragments.
- NPC dialogue tied to Kevin’s philosophy.
- Short completion target: approximately 5–10 minutes.

#### Controls

```text
Arrow keys / WASD   Move
Z / Space           Action
X / Shift           Secondary action
Enter               Start / Pause
Escape              Menu
```

Mobile controls:

- D-pad
- A and B
- Start and Select
- Haptic feedback when available and permitted

#### Completion

At the top of the Signal Tower:

1. The fragments orbit the player.
2. The television image destabilizes.
3. A modem tone appears beneath the music.
4. The message reads: `NEW SIGNAL FOUND — YEAR 2000`.
5. The visitor can continue to 2000 or return to the channel guide.

#### Accessible story mode

A text-based equivalent presents the same map, choices, dialogue, fragments, and ending without requiring canvas play.

### 1990 Easter eggs

- Antenna position reveals a hidden station identification.
- An original controller-code sequence unlocks a bonus room.
- Leaving the television on static triggers a fake commercial break.
- Rewinding the home-video tape past the beginning reveals a future frame.
- Pressing reset at a specific title-screen moment changes the cartridge label.

### Exit transition to 2000

1. Static expands beyond the TV bezel.
2. The camera passes through the curved glass.
3. Scanlines stretch into horizontal data lines.
4. Static becomes modem noise.
5. The view resolves on a beige CRT in the year-2000 room.

Reduced motion uses a static crossfade and short modem sound cue.

---

## Page 4 — `/experience/2000` — Kevin Online

### Purpose

Show the moment technology becomes social, explorable, personal, and programmable through an AOL-style online service.

### Emotional target

Anticipation, connection, discovery, early-internet optimism, and playful experimentation.

### Environment

A year-2000 bedroom or home-office desk:

- Beige CRT.
- Computer tower.
- Keyboard and ball mouse.
- External modem.
- Speakers.
- Telephone cable.
- Stack of free-hours CDs.
- Printed pages and notes.
- Small power and modem LEDs.

### Entry storyboard

#### Frame 1 — Arrival at the desk

The CRT displays the WinDohs startup screen.

The room is visible for a moment before the camera settles into a readable monitor view.

Returning visitors may skip startup.

#### Frame 2 — Kevin Online Sign On

The sign-on window contains:

- Kevin Online 5.0 branding.
- Screen name.
- Password.
- Location.
- Save password.
- Dial-up-sound control.
- Setup.
- Access Numbers.
- Help.
- Sign On.

A guest screen name is prefilled so the visitor never has to create an account.

#### Frame 3 — Dial-up connection

A separate dialog progresses through:

1. Dialing.
2. Connecting.
3. Verifying screen name.
4. Signing on.
5. Connected.

The modem and tower LEDs react in the 3D room.

Sound is opt-in. Cancel returns to Sign On.

#### Frame 4 — Welcome channel

The main Kevin Online window opens.

The visitor hears an original mail notification when sound is enabled.

Welcome content includes:

- New mail.
- Buddy status.
- Favorite destinations.
- Projects.
- Resume.
- Xanga.
- Connection timer.
- Free-hours promotion.
- Kevin’s early-internet origin story.

A guide buddy sends the first optional IM:

> Welcome to Kevin Online. Want the quick tour, the weird internet version, or Kevin’s work?

Actions:

- Quick tour
- Show projects
- Open Xanga
- I’ll explore

### Core application storyboard

#### K-Mail

Story functions:

- Messages from different points in Kevin’s timeline.
- Early experimentation and internet-culture references.
- Project briefs disguised as attachments.
- Optional future transmission.

Functional behaviors:

- New, Old, Sent, Deleted.
- Read/unread state.
- Compose.
- Reply.
- Forward.
- Delete and restore.
- Local persistence.

#### Buddy List and Instant Messages

The Buddy List is the conversational navigation layer.

Buddy types should eventually include:

- Career/resume guide.
- Project specialist.
- Systems/technology guide.
- Nostalgic host.
- Hidden cross-era character.

A conversation can open other windows without closing the IM.

Example:

> Visitor: Show me a project where Kevin turned a messy process into a system.  
> Buddy: The strongest match is [Project]. Kevin clarified the operating model, connected the workflow, and designed the execution system.  
> Actions: Open Project · Quick Results · How He Approached It

#### Kevin Explorer

Functions:

- Back, forward, home, refresh.
- Favorites.
- Address and keyword field.
- Internal early-web pages.
- Safe external-link behavior.

Key destinations:

- Kevin’s homepage.
- Projects.
- Resume.
- About.
- Xanga.
- Hidden keyword pages.

#### KevinY2K’s Xanga

The Xanga page appears inside Kevin Explorer.

Content:

- Profile.
- Weblog entries.
- Sites I Read.
- Blogrings.
- Currently Playing.
- Mood.
- Project and technology reflections.

Functions:

- eProps.
- Comments.
- Subscribe/unsubscribe.
- Search.
- Classic, Midnight, and Glitter skins.
- Protected future post.

Each post should reveal a piece of Kevin’s progression from internet exploration toward systems, automation, and building.

#### Projects

Projects are presented as:

- Downloads.
- Folders.
- Zip archives.
- Website bookmarks.
- Attached files.

Selecting one opens a period-styled project window while preserving a real canonical project URL.

#### Resume

The resume opens as a WinDohs document viewer with:

- Quick scan.
- Full chronology.
- Skills.
- Print.
- Download.
- Open clean web version.

### 2000 Easter eggs

- Busy signal or phone-line interruption.
- Hidden keyword routes.
- Away-message jokes.
- Free-hours CD collection.
- Secret screen name.
- Download-time estimate gag.
- Source-code comment on the homepage.

### Exit transition to 2010

The visitor opens a profile image, blog post, or shared media item.

1. The selected object fills the CRT.
2. Scanlines disappear.
3. The display becomes flatter and wider.
4. The browser chrome transforms into the StealStreet Commerce OS workspace.
5. The surrounding desk updates to 2010.

---

## Page 5 — `/experience/2010` — StealStreet Commerce OS

### Purpose

Show the commerce chapter as the operating system Kevin worked inside: the One Stop Deals / StealStreet operations platform, reconstructed as an explorable enterprise command center.

### Emotional target

Competence, scale, and the satisfaction of a system that closes its loops.

### Environment

A fulfillment workstation with an in-house commerce system map, packing bench, parcels, inventory shelving, and label equipment. The Project Blueprint artifact is the commerce operating-system map itself.

### Entry storyboard

#### Frame 1 — The dashboard

The focused interface opens on the operations dashboard with scale signals taken from canonical content (the catalog-record and channel counts in `src/content`).

#### Frame 2 — Follow one order

The visitor follows the end-to-end lifecycle: Vendor → Purchase Order → Inventory → Catalog → Marketplace → Customer Order → Warehouse → Customer.

#### Frame 3 — Resolve an exception

Representative Orders, Purchase Orders, Catalog, Marketplaces, Warehouse, and Reports workspaces surface actionable exceptions. Fixing one (for example shipping an order or repairing a listing) visibly updates the connected records.

### Secondary functions

Company hub, customer service, returns, finance, automation, permissions, audit, vendor, inventory, and administration evidence; cross-entity search; browser Back/Forward restore the active module.

### 2010 Easter eggs

- A discoverable archive inventory.
- Persistent Project Blueprint recovery.
- The time-traveler welcome for visitors arriving from another era.

### Exit transition to 2020

A video post appears in the Wall.

1. The visitor opens it.
2. The media expands.
3. The wide display rotates into portrait.
4. Reactions separate from the page.
5. The laptop becomes a smartphone and KevTok begins.

---

## Page 6 — `/experience/2020` — KevTok

### Purpose

Present Kevin’s story, projects, systems thinking, and current work in the short-form, mobile-first media language of the decade.

### Emotional target

Momentum, clarity, creativity, compression, and high-signal storytelling.

### Environment

A creator workspace centered on a smartphone:

- Ring light.
- Small microphone.
- Laptop with editing timeline.
- Phone mount.
- Abstract reaction particles.

### Entry storyboard

#### Frame 1 — Phone wakes

The KevTok logo appears briefly.

A clear statement sets expectations:

> Eight clips. No infinite feed.

The visitor sees progress `1 / 8`.

#### Frame 2 — First clip

The first clip automatically displays but does not play audio without permission.

Captions are always visible.

Actions:

- Play/pause.
- Next/previous.
- Like.
- Save.
- Comment.
- Share.
- Transcript.
- Open full story.

### Recommended eight-clip narrative

#### Clip 1 — Who is Kevin?

A concise identity and positioning clip.

Takeaway:

> Kevin connects strategy, systems, technology, and execution.

#### Clip 2 — What problems does Kevin like?

Focus on ambiguity, fragmented workflows, difficult coordination, and turning ideas into practical systems.

#### Clip 3 — Kevinception

The portfolio itself as a case study in product thinking, interaction design, storytelling, and engineering.

#### Clip 4 — Systems and automation

A visual before/after explanation of turning manual or disconnected work into a designed operating system.

#### Clip 5 — Product and experience thinking

How Kevin balances user experience, business needs, technology, and delivery.

#### Clip 6 — AI and agents

The transition from chatbot usage to context, orchestration, memory, roles, governance, and measurable execution.

#### Clip 7 — How Kevin works

Operating principles:

- Clarify the real problem.
- Map the system.
- Design the leverage point.
- Build the practical version.
- Measure and refine.

#### Clip 8 — What are you trying to build?

The conversion clip.

Actions:

- View projects.
- Open resume.
- Contact Kevin.
- Continue to 2030.

### Feed behavior

- Vertical scroll-snap.
- Arrow-key and swipe support.
- Visible finite progress.
- Filter channels: Story, Projects, Systems, AI.
- No dark-pattern autoplay loop.
- Every clip has a transcript and full-detail destination.

### 2020 Easter eggs

- Hidden Drafts folder.
- Algorithm-joke caption.
- Duet with a StealStreet product listing.
- Creator analytics parody.
- A comment from holographic Kevin.
- Saved 2000 attachment reappears as a video asset.

### Exit transition to 2030

1. The phone's light spills into the room.
2. The studio dissolves into a warm apartment at 07:12.
3. Saito speaks first.

---

## Page 7 — `/experience/2030` — Morning, Together

### Purpose

Show a credible near-future life alongside a household intelligence, Saito, and make Kevin's thinking about context, authority, and consent felt through ordinary moments rather than a dashboard.

### Emotional target

Warmth, trust, restraint, and the relief of being asked.

### Content status

Everything in 2030 is design fiction and is labeled as such. TokenPak, TIP, and PAK are real projects and appear only in an optional infrastructure receipt as provenance.

### Environment

A warm, spatially zoned smart home: a local-sensing kitchen, a mounted-context studio, a guest-safe living room, a threshold, a dinner table, and a visible home nervous system. A brass commitment dial on the kitchen counter embodies the human-authority gate.

### Moment storyboard

The chapter is six ordinary moments from 07:12 to 22:04. The page lighting, room brightness, and sun position follow the time of day. Each moment runs as a beat sequence, `exchange → reveal → consent → settled`:

1. **Exchange.** Saito notices something and speaks first. Kevin answers or directs. The room responds to the active object (the mug, the shared draft, the window desk, the threshold, the dinner table, the glasses).
2. **Reveal.** A casual seed from earlier (“Seed held · 63 days”) surfaces as a staged, multi-domain result. Done and staged items land first; the gated item lands last.
3. **Consent.** The room dims and the page holds still for one question: keep this moment with me, or let it end here. Nothing consequential is committed except by Kevin's hand at the dial.
4. **Settled.** Saito reports what changed or why it stopped, with a retention receipt.

The 20:15 anchor moment turns nine words about Asia into a staged year (passport renewal, fare corridors, seasons, family dates, one refundable hold) while booking and spend stay behind the gate.

### The boundary lens

The agent trace (`Sense → Interpret → Check authority → Act or wait → Receipt`), the standing-authority map (Full auto, Notify first, Stage to gate, Stage only, Draft only), the incubation ledger, and the infrastructure receipt live in one inspectable overlay opened from the masthead. Transparency is on demand; it never replaces the conversation, and it never claims to reveal hidden chain-of-thought.

### Live mode

Optional. Saito leads the exchange on a natural clock and speaks aloud when sound is on. Any tap interrupts. Consent is never advanced by the machine.

### Exit transition to 2040

The same apartment, ten years later. Every keep or refuse decision travels with the visitor.

---

## Page 8 — `/experience/2040` — Morning, After

### Purpose

Show a speculative reproduction of Kevin built only from the memories the visitor allowed in 2030, and let consent become the portrait.

### Emotional target

Calm, reflection, continuity, and a slight sense of the uncanny.

### Required disclosure

Holographic Kevin is an authored reproduction built from permissioned memory and design fiction. He is not transferred consciousness and not the biological Kevin.

### Environment

The 2030 apartment rebuilt as black glass, rain, sodium amber, and vermilion light. The same mug sits on the counter, and a hand that cannot touch it.

### Entry storyboard

#### Frame 1 — Memory bands

The hologram is formed from six light bands, one per 2030 moment. Kept moments glow; refused moments stay dashed, deliberate blanks. A six-slot memory constellation shows what was kept. If no 2030 moment was witnessed, the room says so: he can only remember what you allowed.

#### Frame 2 — Environmental cues

Cues in the room (including a boarding pass, unprinted, carried from the 20:15 staged year) drive `Notice → Recall → Deliberate → Act → Continue`. Holographic Kevin speaks, demonstrates, initiates, and refuses.

#### Frame 3 — Source trace

A theatrical source trace separates stable records, incomplete patterns, and frayed conjecture that he refuses to promote into memory.

#### Frame 4 — The question

“May I keep this?” Keeping or releasing the encounter changes the room: letting him disappear disperses the hologram and dims the apartment. Both outcomes light the exit to reach the living Kevin.

### Reduced-motion adaptation

- Ambient loops hold a legible frame.
- State changes still announce themselves as short fades.
- The complete response is always available as text.

---

# 5. Canonical portfolio pages

The immersive experience demonstrates creativity. The canonical pages establish credibility and make the site useful to recruiters, clients, search engines, assistive technology, and visitors with limited time.

---

## Page 9 — `/portfolio` — Direct Portfolio Home

### Purpose

Answer what Kevin does, show the strongest work, and create a clear contact path within seconds.

### Storyboard

#### Section 1 — Hero

Headline direction:

> Kevin turns ambitious ideas into practical systems, products, and execution.

Supporting roles:

- Entrepreneur
- Product and project leader
- Technology and business consultant
- Systems and automation builder

Primary actions:

- View selected work
- Contact Kevin

Secondary action:

- Enter Kevinception

A restrained 3D Kevinception totem may react in the background, but content remains the priority.

#### Section 2 — Selected work

Three to five flagship case studies.

Each card shows:

- Problem.
- Kevin’s role.
- Main contribution.
- Outcome or evidence.
- Disciplines.

#### Section 3 — Capability system

Groups:

- Strategy and systems.
- Product and experience.
- Operations and execution.
- Technology and automation.
- AI and agentic workflows.

#### Section 4 — Experience snapshot

A concise chronology with a link to the full resume.

#### Section 5 — How Kevin works

A simple five-step operating model:

1. Clarify.
2. Map.
3. Design.
4. Build.
5. Refine.

#### Section 6 — Technology timeline

A compact summary of the six eras with direct links.

#### Section 7 — Contact

One primary conversion path.

---

## Page 10 — `/work` — Work Index

### Purpose

Help visitors find relevant projects quickly.

### Layout

- Clear page title and summary.
- Filter by discipline, problem type, industry, or capability.
- Search.
- Featured projects first.
- Remaining projects in a scannable grid or list.

### Project card content

- Title.
- One-sentence problem.
- Kevin’s role.
- Key outcome or evidence.
- Tags.
- Open case study.
- View across eras, when available.

### Optional immersive enhancement

Hovering or focusing a project may show how it appears in 1990, 2000, 2010, 2020, 2030, and 2040. This is decorative and should not delay navigation.

---

## Page 11 — `/work/[project-slug]` — Case Study

### Purpose

Provide verifiable evidence of Kevin’s thinking and execution.

### Storyboard / section order

1. **Project hero** — title, concise result, role, date, disciplines.
2. **Executive summary** — what happened and why it matters.
3. **Problem** — situation and stakes.
4. **Context and constraints** — what made the work difficult.
5. **Kevin’s role** — ownership, responsibilities, collaborators.
6. **Approach** — how the problem was framed and solved.
7. **Key decisions** — tradeoffs and rationale.
8. **System or workflow** — visual model.
9. **Execution** — what was built or changed.
10. **Outcomes and evidence** — metrics or qualitative proof.
11. **Artifacts** — screenshots, documents, diagrams, video, code, or prototypes.
12. **What Kevin learned** — reflection.
13. **What he would do next** — future opportunity.
14. **Related work**.
15. **Contact CTA**.

### Era links

When relevant:

- Watch the 1990 transmission.
- Open the 2000 project archive.
- View the KevinBook post.
- Watch the KevTok clip.
- Run the 2030 mission.
- Ask Kevin Echo.

---

## Page 12 — `/resume` — Resume

### Purpose

Provide the fastest complete professional overview.

### Modes

- **Quick view** — one-page scan.
- **Full view** — detailed chronology and evidence.
- **Print / download**.

### Sections

- Summary.
- Core capabilities.
- Experience chronology.
- Selected projects.
- Tools and technical capabilities.
- Leadership and operating approach.
- Education and credentials, when confirmed.
- Contact.

### Immersive link

> See how the technology timeline shaped Kevin’s work.

---

## Page 13 — `/about` — About Kevin

### Purpose

Connect the professional story to the human and technology narrative.

### Section order

1. Short personal introduction.
2. The technology-origin story.
3. How Kevin thinks.
4. What types of problems energize him.
5. What he values in collaboration.
6. Interests and experiments.
7. Six-era timeline summary.
8. Current focus.
9. Contact CTA.

The page should feel authored and personal without becoming a full autobiography.

---

## Page 14 — `/contact` — Contact

### Purpose

Convert interest into a clear next step with minimal friction.

### Storyboard

#### Section 1 — Invitation

> Have an ambitious idea, a complicated system, or a project that needs clearer execution?

#### Section 2 — Intent selector

- Consulting or advisory.
- Product / project leadership.
- Systems and automation.
- AI and agent workflows.
- Collaboration or partnership.
- Speaking or creative work.
- Other.

#### Section 3 — Form

- Name.
- Email.
- Organization, optional.
- What are you trying to accomplish?
- Timeframe, optional.
- Preferred next step.

#### Section 4 — Alternatives

- Public email.
- LinkedIn or approved profile.
- Download resume.

#### Section 5 — Final Kevinception touch

A small line:

> Prefer the future interface? Send the message through Kevin Echo.

That action opens the 2040 contact interpretation but still submits through a normal form.

---

## Page 15 — `404` — Lost Signal

### Purpose

Recover gracefully without trapping the visitor.

### Design

The current era determines the treatment:

- 1990 — No broadcast signal.
- 2000 — Page cannot be displayed.
- 2010 — Content unavailable.
- 2020 — Video removed or unavailable.
- 2030 — Objective route unresolved.
- 2040 — Memory not found.

Actions:

- Timeline.
- Portfolio.
- Search work.
- Home.

---

# 6. Cross-era transition storyboard

| From | To | Visual transformation | Audio bridge | Reduced-motion version |
|---|---|---|---|---|
| Threshold | Timeline | Kevinception rings separate into a path | Low temporal pulse | Fade to timeline |
| Timeline | 1990 | Camera approaches dark television | Room tone and switch click | Cut to TV close-up |
| 1990 | 2000 | Static fills frame; TV glass becomes CRT | Static becomes modem | Static crossfade |
| 2000 | 2010 | Xanga/profile media expands; CRT flattens | IM tone becomes notification | Crossfade via profile image |
| 2010 | 2020 | Video post rotates into portrait phone | Notification becomes beat | Fade to phone feed |
| 2020 | 2030 | Reactions and captions become nodes | Beat becomes processing pulse | Dissolve into graph |
| 2030 | 2040 | Agent memories merge into human signal | Processing pulse becomes resonance | Fade from core to hologram |
| 2040 | Portfolio | Hologram dissolves into clean present-day page | Resonance resolves to silence | Direct fade |

### Reverse movement

Reverse transitions should feel like rewinding rather than replaying the full forward sequence.

Examples:

- 2000 → 1990: modem noise collapses into television static.
- 2020 → 2010: phone video shrinks into a KevinBook post.
- 2040 → 2030: hologram separates back into agent nodes.

### Transition safeguards

- Major transition: 1.5–2.5 seconds.
- Skip available after 0.5 seconds.
- Input is locked only during the shortest necessary portion.
- The next scene is preloaded before the transition begins.
- Failure falls back to a clean route change.

---

# 7. Primary user journeys

---

## Journey A — First-time immersive explorer

### Goal

Experience Kevinception as an authored technology-life story.

### Flow

```text
Threshold
→ Timeline
→ 1990 KevinVision
→ Channel exploration
→ 8-bit game
→ 2000 Kevin Online
→ Buddy / Xanga / project
→ 2010 KevinBook
→ Wall and project post
→ 2020 KevTok
→ Finite clip series
→ 2030 Kevin Nexus
→ Agent mission and human gate
→ 2040 Kevin Echo
→ Final synthesis
→ Portfolio or Contact
```

### Key conversion moments

- After the first project transmission in 1990.
- After a buddy recommendation in 2000.
- After a project post in 2010.
- After a project clip in 2020.
- After an agent mission in 2030.
- At the final 2040 synthesis.

### Journey requirement

The visitor should never be forced to complete a game, find an Easter egg, or visit every era to reach Kevin’s work or contact information.

---

## Journey B — Recruiter or hiring manager

### Goal

Understand Kevin’s fit quickly.

### Flow

```text
Threshold
→ View Portfolio
→ Hero and capabilities
→ Resume quick view
→ One flagship case study
→ Contact or resume download
```

Optional immersive preview:

- Watch the 2020 “Who is Kevin?” clip.
- Open the 2000 resume window.

### Success condition

Within approximately two minutes, the visitor can identify:

- What Kevin does.
- His strongest capabilities.
- Relevant project evidence.
- How to contact him.

---

## Journey C — Prospective client

### Goal

Determine whether Kevin can solve a specific business, product, systems, or automation problem.

### Flow

```text
Threshold
→ 2020 or 2030
→ Relevant clip or sample mission
→ Recommended project
→ Full case study
→ Contact form with intent preselected
```

### Example

1. Visitor enters 2030.
2. Selects “Diagnose a broken workflow.”
3. Agents create a transparent plan.
4. The interface connects the method to a real Kevin project.
5. Visitor opens the case study.
6. Contact form opens with “Systems and automation” selected.

---

## Journey D — Creative or technical evaluator

### Goal

Assess Kevin’s design thinking, engineering capability, and attention to detail.

### Flow

```text
Threshold
→ 1990
→ Physical TV and game
→ 2000 transition
→ Kevin Online window system
→ Implementation details / project case study
→ 2030 agent system
→ Technical notes or source repository
```

### Success condition

The site itself demonstrates:

- Interaction design.
- 3D engineering.
- State architecture.
- Responsive adaptation.
- Accessibility.
- Performance design.
- Content systems.
- Narrative coherence.

---

## Journey E — Returning visitor

### Goal

Continue without replaying known sequences.

### Entry state

The threshold displays:

- Last visited year.
- Completion status.
- Collected artifacts.
- New or updated project content.

### Flow options

- Continue from last year.
- Jump to unlocked artifact.
- Revisit favorite era.
- Open Portfolio Mode.
- Reset timeline.

Open applications and conversations may be restored within reasonable limits.

---

## Journey F — Mobile visitor

### Goal

Receive a complete experience without manipulating a tiny desktop inside a 3D room.

### Flow behavior

1. Lightweight 3D or video environmental reveal.
2. Tap the device.
3. Interface expands to near full screen.
4. Era-native controls remain touch-friendly.
5. Step Back returns to the device.
6. Swipe or visible buttons move between years.

Specific adaptations:

- 1990 — large TV controls and on-screen gamepad.
- 2000 — Kevin Online apps become full-screen panels.
- 2010 — single-column profile and feed.
- 2020 — native vertical feed.
- 2030 — nodes simplify into a mission flow plus evidence panel.
- 2040 — hologram remains visible above the chat interpreter.

---

## Journey G — Reduced motion, low performance, or no WebGL

### Goal

Preserve all content and functions without requiring full 3D rendering.

### Flow

- Timeline becomes semantic year cards.
- Environments use static illustrations or restrained video.
- Device interfaces remain fully functional HTML.
- Transitions become fades.
- 1990 game offers accessible story mode.
- 2030 agent mission uses a structured diagram.
- 2040 uses a static holographic portrait and transcript.

No portfolio content, route, or contact action is lost.

---

# 8. Cross-era artifacts and continuity

Cross-era artifacts make Kevinception feel like one connected story rather than six themes.

## Recommended artifact set

### Artifact 1 — Signal fragment

- 1990: collectible game fragment.
- 2000: downloaded `.sig` file.
- 2010: image in a tagged album.
- 2020: transition asset in a saved draft.
- 2030: memory object used by an agent.
- 2040: core identity shard.

### Artifact 2 — Kevin’s screen name

- 1990: scrambled Channel 13 text.
- 2000: active Buddy List identity.
- 2010: old account linked to the profile.
- 2020: username watermark.
- 2030: legacy agent identifier.
- 2040: source-provenance record.

### Artifact 3 — Project blueprint

- 1990: future transmission.
- 2000: zip attachment.
- 2010: shared Note.
- 2020: explainer clip.
- 2030: mission template.
- 2040: reconstructed design memory.

### Artifact 4 — The totem

An original Kevinception symbol travels between worlds and always returns the visitor to the timeline.

### Progress behavior

- Discovery state is stored locally.
- Essential content is never gated.
- A memory archive explains what has been found.
- Returning visitors can revisit transformed versions.

---

# 9. Content delivery matrix

| Content | 1990 | 2000 | 2010 | 2020 | 2030 | 2040 | Canonical route |
|---|---|---|---|---|---|---|---|
| Bio | Curiosity Club / Home Video | About / profile | About tab | Intro clip | Kevin connection panel | Identity reconstruction | `/about` |
| Capabilities | Public Access | Resume / buddies | Profile and About | Capability clips | Agent roles | Thought nodes | `/portfolio` / `/resume` |
| Projects | Future Files | Downloads / folders | Project posts | Project clips | Missions and evidence | Memory shards | `/work/[slug]` |
| Resume | Channel 7 summary | Resume app | About / work history | Resume CTA | Verified profile memory | Provenance record | `/resume` |
| Philosophy | NPC dialogue | IM / Xanga | Notes | How Kevin Works clip | Human-control model | Echo responses | `/about` |
| Contact | Public Access | Mail / profile | Message | Final clip | Human contact action | Contact biological Kevin | `/contact` |

---

# 10. Global completion and exit states

## Era completion

Each era has a soft completion condition, not a mandatory checklist.

- 1990: watch one story channel and activate Channel 3, or choose continue.
- 2000: open one communication app and one content app.
- 2010: view one milestone and one project post.
- 2020: watch or read three clips.
- 2030: reach the human decision gate.
- 2040: send one thought and open one memory.

The next year is always available even before completion.

## Full journey ending

After 2040:

1. The hologram summarizes the technology-life pattern.
2. The six devices appear in a line.
3. The present-day portfolio replaces the speculative chamber.
4. The primary CTA is contact or selected work.
5. The visitor may restart or revisit any year.

---

# 11. Analytics events tied to the storyboard

```text
threshold_viewed
entry_mode_selected
timeline_viewed
year_previewed
year_entered
device_activated
interface_focused
channel_changed
game_started
game_fragment_collected
game_completed
kol_signon_started
kol_connected
application_opened
buddy_message_sent
xanga_opened
kevinbook_tab_opened
kevtok_clip_viewed
kevtok_clip_completed
nexus_mission_started
nexus_human_gate_reached
echo_thought_sent
memory_shard_opened
artifact_discovered
project_opened
resume_opened
contact_started
contact_completed
timeline_completed
```

The product should prioritize meaningful content engagement and conversion rather than raw session duration.

---

# 12. Storyboard acceptance criteria

The storyboard is successfully implemented when:

1. A first-time visitor understands the concept and chooses a path within seconds.
2. Every year communicates one iconic technology interface and one clear emotional idea.
3. Every era exposes Kevin’s biography, capabilities, projects, and next actions without relying on Easter eggs.
4. The visitor can move directly to any year.
5. The visitor can enter Portfolio Mode from every era.
6. The physical 3D environments enhance the interfaces rather than competing with them.
7. HTML content remains readable, selectable, responsive, and accessible.
8. The 1990 game works with keyboard, touch, and accessible story mode.
9. Kevin Online behaves like a connected online service rather than a static skin.
10. KevinBook behaves like a social profile rather than a collection of cards.
11. KevTok is finite, captioned, transcript-supported, and connected to full case studies.
12. Kevin Nexus visibly separates agent work, evidence, uncertainty, and human decisions.
13. Kevin Echo clearly distinguishes speculation from literal consciousness.
14. Transitions feel connected but remain skippable.
15. Mobile users receive complete functionality.
16. Reduced-motion and no-WebGL users lose no essential information.
17. Cross-era artifacts transform coherently.
18. Resume, project, and contact facts remain identical across all presentations.
19. The final journey leads naturally to selected work or contact.
20. The experience remains understandable even when the visitor ignores every Easter egg.

---

# 13. Recommended production order

## Vertical slice

Build and validate:

```text
Threshold
→ Timeline
→ 1990 television
→ Channel 3 game
→ Static portal
→ 2000 desk
→ Kevin Online Sign On
→ One real project
→ Portfolio route
```

This proves the shared canvas, physical-device interaction, 2D interface mounting, game input, camera transition, audio bridge, mobile adaptation, content integration, and direct-route fallback.

## Second release

- Complete Kevin Online.
- Add KevinBook.
- Add canonical case-study content.
- Finalize cross-era artifact state.

## Third release

- Add KevTok media.
- Add Kevin Nexus.
- Add Kevin Echo.
- Complete the end-to-present transition.

---

# 14. Final journey summary

```text
THE THRESHOLD
Technology changes. Curiosity compounds.

        ↓

THE TIMELINE
Choose a device. Enter a year.

        ↓

1990 — WONDER
A television becomes a portal.
A game teaches systems through play.

        ↓

2000 — CONNECTION
The modem connects.
The internet becomes identity, experimentation, and possibility.

        ↓

2010 — PARTICIPATION
The profile becomes public.
Technology becomes community and self-definition.

        ↓

2020 — CREATION
The feed compresses stories.
Kevin communicates ideas, projects, and systems at speed.

        ↓

2030 — ORCHESTRATION
Intent becomes coordinated work.
Agents amplify—but do not replace—human judgment.

        ↓

2040 — CONTINUITY
Memory becomes an interface.
A speculative echo explains the pattern across the decades.

        ↓

THE PRESENT
See the real work.
Read the real resume.
Contact the real Kevin.
```
