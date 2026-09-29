# 04 — Page Completion Checklists

Use these checklists as release gates. A page is not “done” because it renders; it is done when content, function, accessibility, performance, analytics, and failure behavior all pass.

Priority:

- **P0:** Required for public release.
- **P1:** Required for the intended polished experience.
- **P2:** Optional enhancement after core release.

---

# Global release checklist

## Product and content

- [ ] P0 The concept can be understood within 15 seconds.
- [ ] P0 Portfolio, Work, Resume, and Contact are reachable from every era.
- [ ] P0 At least three real, approved case studies are published.
- [ ] P0 All biography, role, date, metric, and credential claims pass trust validation.
- [ ] P0 2030 and 2040 projections are labeled.
- [ ] P0 No essential content depends on game completion, AI, sound, drag, or secrets.
- [ ] P1 Each era has one obvious primary interaction.
- [ ] P1 Every environment reveals meaningful Kevin content.
- [ ] P1 Easter eggs are era-appropriate and coherent.

## Architecture

- [ ] P0 Persistent experience canvas survives year navigation.
- [ ] P0 Canonical routes render semantic HTML.
- [ ] P0 Current era only is mounted; adjacent assets are preloaded selectively.
- [ ] P0 Scene resources dispose without unbounded memory growth.
- [ ] P0 Route and state remain synchronized.
- [ ] P0 WebGL failure produces a usable semantic experience.
- [ ] P1 High, Standard, and Lite tiers work.
- [ ] P1 On-demand rendering is used when scenes are idle.

## Accessibility

- [ ] P0 WCAG 2.2 AA target checked.
- [ ] P0 All primary actions work with keyboard.
- [ ] P0 3D hotspots have semantic equivalents.
- [ ] P0 Reduced-motion mode preserves meaning and function.
- [ ] P0 Audio is optional.
- [ ] P0 Captions/transcripts exist for media.
- [ ] P0 No keyboard traps.
- [ ] P0 Focus management passes.
- [ ] P0 Mobile touch targets pass.
- [ ] P1 Accessible scene map is available from every era.

## Quality and testing

- [ ] P0 Unit, component, E2E, accessibility, route, and content tests pass.
- [ ] P0 No uncaught console/page errors.
- [ ] P0 Internal links pass.
- [ ] P0 Security headers and CSP pass.
- [ ] P0 Asset/license scan passes.
- [ ] P0 Performance budgets pass.
- [ ] P0 Mobile portrait and landscape pass.
- [ ] P1 Visual regression approved for each quality tier.
- [ ] P1 Repeated six-era switching does not leak material GPU memory.

---

# Page A — Threshold `/`

## Content

- [ ] P0 Kevinception wordmark is real text or has accessible text.
- [ ] P0 Headline explains technology-life timeline.
- [ ] P0 Supporting copy explains Kevin is the subject.
- [ ] P0 Enter Timeline and View Portfolio are primary.
- [ ] P0 Resume, Work, and Contact are visible.
- [ ] P1 Returning-visitor continuation copy is clear.
- [ ] P1 Device silhouettes correspond to the six years.

## Functionality

- [ ] P0 Timeline opens in one action.
- [ ] P0 Portfolio opens without waiting for 3D.
- [ ] P0 Skip works.
- [ ] P0 Sound remains off until enabled.
- [ ] P0 Motion preference can be changed.
- [ ] P0 Start Over clears only narrative progress after confirmation.
- [ ] P1 Continue resumes stable year state.

## R3F / visual

- [ ] P0 First paint does not depend on canvas.
- [ ] P1 Six rings/device silhouettes animate smoothly.
- [ ] P1 Animation never covers buttons.
- [ ] P1 Reduced motion uses static composition.
- [ ] P2 Returning artifacts subtly influence the mark.

## Accessibility and mobile

- [ ] P0 Heading and button order are logical.
- [ ] P0 Full experience can be entered by keyboard.
- [ ] P0 No autoplay audio.
- [ ] P0 Mobile buttons remain above the fold.
- [ ] P0 Screen reader hears concept before decoration.

## Performance and tests

- [ ] P0 Semantic content appears before R3F chunk.
- [ ] P0 Threshold E2E passes.
- [ ] P0 Portfolio path E2E passes.
- [ ] P1 Returning session E2E passes.

**Done when:** a first-time visitor can choose immersion or portfolio immediately, and a returning visitor can continue without replaying the intro.

---

# Page B — Timeline `/experience`

## Content

- [ ] P0 All six years have year, name, device, and one-sentence meaning.
- [ ] P0 Kevin connection is stated for each year.
- [ ] P0 Progress indicators do not imply locked content.
- [ ] P1 Artifact count is understandable and optional.

## Functionality

- [ ] P0 Every station is reachable by visible controls.
- [ ] P0 Arrow keys work.
- [ ] P0 Swipe works on mobile.
- [ ] P0 Selecting a year updates route.
- [ ] P0 Browser Back returns to timeline state.
- [ ] P0 Portfolio link remains visible.
- [ ] P1 Last selected station persists during session.

## R3F / visual

- [ ] P0 No free-roam is required.
- [ ] P0 Only selected station is visually dominant.
- [ ] P1 Camera transitions remain under target duration.
- [ ] P1 Device previews use appropriate quality tier.
- [ ] P2 Artifacts appear near corresponding stations.

## Accessibility/mobile

- [ ] P0 Semantic year list mirrors 3D stations.
- [ ] P0 Focus does not jump during camera motion.
- [ ] P0 Reduced motion uses direct selection/crossfade.
- [ ] P0 Mobile does not require precise 3D tapping.

## Tests

- [ ] P0 Direct entry to every year.
- [ ] P0 Keyboard and swipe navigation.
- [ ] P0 Back/Forward.
- [ ] P1 Progress rendering.

**Done when:** every visitor can understand and enter any year without navigating a museum or guessing what an object does.

---

# Page C — 1990 KevinVision

## Environment

- [ ] P0 TV, antenna, console, and controller are present.
- [ ] P0 TV power is independent from console power.
- [ ] P0 Channel controls work.
- [ ] P0 Channel indicator is visible.
- [ ] P0 Channel 3 shows no signal until console is powered.
- [ ] P1 Screen glow affects environment.
- [ ] P1 Antenna/tracking produces controlled signal changes.
- [ ] P2 Period objects support story without clutter.

## Channels

- [ ] P0 Channel 2 delivers era technology context.
- [ ] P0 Channel 4 delivers Kevin’s curiosity story.
- [ ] P0 Channel 5 exposes projects.
- [ ] P0 Channel 7 exposes biography/timeline.
- [ ] P0 Channel 9 exposes capabilities/contact.
- [ ] P1 Channel 13 provides optional cross-era signal.
- [ ] P0 Every informational channel has captions/transcript.
- [ ] P0 No channel invents biography.

## Game

- [ ] P0 Original title, art, map, characters, music, and code.
- [ ] P0 Start, pause, reset, mute.
- [ ] P0 Keyboard controls.
- [ ] P0 Touch controller.
- [ ] P0 Three fragments can be collected.
- [ ] P0 Game can be completed.
- [ ] P0 Game state persists locally.
- [ ] P0 Text-story equivalent reaches same narrative ending.
- [ ] P0 Essential portfolio content remains available without playing.
- [ ] P1 Physical 3D controller dispatches to shared input.
- [ ] P1 Canvas texture updates correctly on TV.
- [ ] P1 Game loads only after console activation.

## Transition

- [ ] P0 Completion offers Continue to 2000 and Return to Guide.
- [ ] P1 Static-to-modem match transition works.
- [ ] P0 Reduced-motion crossfade works.
- [ ] P0 Transition timeout recovers safely.

## Accessibility/mobile

- [ ] P0 Physical controls have semantic equivalents.
- [ ] P0 Game control labels are announced.
- [ ] P0 Touch controller is usable in portrait.
- [ ] P0 No rapid flashing.
- [ ] P1 Haptics are optional.

## Performance/tests

- [ ] P0 Scene loads within budget.
- [ ] P0 Game does not run while inactive.
- [ ] P0 TV/game E2E passes desktop/mobile.
- [ ] P0 Text fallback E2E passes.
- [ ] P1 Scene disposal passes.

**Done when:** a visitor can operate the TV, understand Kevin’s early technology story, play or skip the game, and move naturally into 2000.

---

# Page D — 2000 Kevin Online

## Environment

- [ ] P0 CRT, tower, keyboard, mouse, modem, and phone line are present.
- [ ] P0 CRT screen is readable in interface mode.
- [ ] P0 Modem/tower LEDs respond to connection stages.
- [ ] P1 Desk objects communicate personal context.
- [ ] P1 Step Back reveals physical environment.
- [ ] P2 CD stack supports inspectable Easter egg.

## Boot and Sign On

- [ ] P0 WinDohs startup completes or can be skipped after first completion.
- [ ] P0 Guest screen name is prefilled.
- [ ] P0 Password and location fields work.
- [ ] P0 Save password is local-only.
- [ ] P0 Setup, Access Numbers, and Help open functional dialogs.
- [ ] P0 Sign On opens separate connection dialog.
- [ ] P0 Cancel returns without losing state.
- [ ] P0 Instant-connect accessibility option exists.

## Connection

- [ ] P0 Dialing stage.
- [ ] P0 Connecting stage.
- [ ] P0 Verifying stage.
- [ ] P0 Signing On stage.
- [ ] P0 Connected stage.
- [ ] P0 Progress, text, and ARIA state update.
- [ ] P0 Audio is permission-gated.
- [ ] P0 Retry works.
- [ ] P1 Busy signal Easter egg does not block success.

## Kevin Online shell

- [ ] P0 Menus and toolbar function.
- [ ] P0 Welcome exposes About, Projects, Resume, Xanga, Buddies.
- [ ] P0 Keyword/address navigation works.
- [ ] P0 Status and connection timer work.
- [ ] P0 Window manager supports focus, drag alternative, resize, minimize, maximize, restore, close.
- [ ] P0 Off-screen window recovery works.
- [ ] P1 Window/session state restores locally.

## K-Mail

- [ ] P0 New, Old, Sent, Deleted.
- [ ] P0 Unread count.
- [ ] P0 Read state.
- [ ] P0 Compose/send.
- [ ] P0 Reply/forward.
- [ ] P0 Delete/restore.
- [ ] P0 Persistence.
- [ ] P1 Attachments can open allowlisted project/artifact content.

## Buddy List and IM

- [ ] P0 Manual Buddy List navigation works without AI.
- [ ] P0 Minimum three distinct roles are defined for launch target.
- [ ] P0 Conversation remains open beside project/resume.
- [ ] P0 Known commands work offline.
- [ ] P0 Generated answers cite approved source IDs.
- [ ] P0 UI actions are allowlisted.
- [ ] P0 AI outage uses in-character fallback.
- [ ] P1 Conversation topic persists across minimize/restore.
- [ ] P1 Concise and expanded reply modes work.

## Browser and Xanga

- [ ] P0 Back, Forward, Home, Refresh, Favorites, Address.
- [ ] P0 Xanga reachable from at least four visible paths.
- [ ] P0 Xanga accepted through keyword and URL.
- [ ] P0 Xanga renders inside browser.
- [ ] P0 Profile and posts.
- [ ] P0 eProps.
- [ ] P0 Comments.
- [ ] P0 Subscribe.
- [ ] P0 Sites I Read and blogrings.
- [ ] P0 Search.
- [ ] P0 Three skins.
- [ ] P0 Persistence.
- [ ] P1 Protected future entry integrates artifact state.

## Transition/accessibility/mobile

- [ ] P0 Profile-media transition to 2010 works.
- [ ] P0 Reduced-motion fallback works.
- [ ] P0 Mobile app panels remain fully usable.
- [ ] P0 Toolbar is touch accessible.
- [ ] P0 Screen reader can navigate applications.
- [ ] P0 No desktop-only drag requirement.

## Tests

- [ ] P0 Sign On/cancel/retry/success E2E.
- [ ] P0 Mail E2E.
- [ ] P0 Xanga E2E.
- [ ] P0 Window manager E2E.
- [ ] P0 Mobile E2E.
- [ ] P0 AI outage E2E.
- [ ] P1 1990 artifact propagation E2E.

**Done when:** Kevin Online feels like a coherent, functioning early-online service that reveals Kevin’s story and work—not a collection of static retro windows.

---

# Page E — 2010 KevinBook

## Environment

- [ ] P0 Laptop/flat display establishes era.
- [ ] P0 Early smartphone exists as secondary object.
- [ ] P1 Notifications affect device/environment subtly.
- [ ] P1 Step Back works.
- [ ] P2 Photos can emerge spatially without blocking UI.

## Profile and content

- [ ] P0 Profile identity and cover.
- [ ] P0 Short bio and current focus.
- [ ] P0 Wall.
- [ ] P0 About.
- [ ] P0 Projects.
- [ ] P0 Photos.
- [ ] P0 Notes.
- [ ] P0 Contact path.
- [ ] P0 Canonical project facts remain consistent.

## Social functions

- [ ] P0 Like state.
- [ ] P0 Comment submission and safe rendering.
- [ ] P0 Local status publishing.
- [ ] P0 Search.
- [ ] P0 Messages.
- [ ] P0 Poke.
- [ ] P0 Friend request.
- [ ] P1 Application-request parody.
- [ ] P0 Persistence and reset.

## Transition/accessibility/mobile

- [ ] P0 Video-to-phone transition works.
- [ ] P0 Reduced-motion fallback.
- [ ] P0 Responsive feed feels like a normal social page.
- [ ] P0 Tabs work by keyboard.
- [ ] P0 Comments/forms have labels and errors.

## Tests

- [ ] P0 Tab E2E.
- [ ] P0 Like/comment/status persistence.
- [ ] P0 Search.
- [ ] P0 Project open.
- [ ] P1 Artifact transformation.

**Done when:** the page explains Kevin’s identity and development through a believable social-era interface with functional, restrained interactions.

---

# Page F — 2020 KevTok

## Environment

- [ ] P0 Smartphone is focal device.
- [ ] P0 Creator workspace supports context without clutter.
- [ ] P1 Likes/reactions may briefly escape phone in 3D.
- [ ] P0 Step Back works.

## Feed

- [ ] P0 Finite clip count is visible.
- [ ] P0 Recommended eight-clip narrative is complete.
- [ ] P0 Vertical scroll-snap.
- [ ] P0 Keyboard and swipe.
- [ ] P0 Play/pause.
- [ ] P0 Captions.
- [ ] P0 Transcript.
- [ ] P0 Like/save/comment/share.
- [ ] P0 Filters.
- [ ] P0 Full project/story CTAs.
- [ ] P0 No endless autoplay.
- [ ] P0 Comments are sanitized.
- [ ] P1 Media preloads one item ahead.

## Content

- [ ] P0 Who Kevin is.
- [ ] P0 Problems Kevin solves.
- [ ] P0 Kevinception.
- [ ] P0 Systems/automation.
- [ ] P0 Product/experience.
- [ ] P0 AI/agents.
- [ ] P0 Working style.
- [ ] P0 Contact/final CTA.
- [ ] P0 Claims are source-backed.

## Transition/accessibility/mobile

- [ ] P0 Nodes transition to 2030.
- [ ] P0 Reduced-motion crossfade.
- [ ] P0 Mobile feed is first-class.
- [ ] P0 Captions default on where appropriate.
- [ ] P0 Transcript is keyboard/screen-reader accessible.
- [ ] P0 Video has poster/text fallback.

## Tests

- [ ] P0 Swipe/keyboard.
- [ ] P0 Transcript.
- [ ] P0 Like/save/comment persistence.
- [ ] P0 Project CTA.
- [ ] P0 Slow-network fallback.
- [ ] P1 2020→2030 artifact handoff.

**Done when:** a visitor can understand Kevin’s current work through concise authored media without losing accessibility, depth, or control.

---

# Page G — 2030 Kevin Nexus

## Disclosure/content

- [ ] P0 Projection label is prominent.
- [ ] P0 Assumptions are available.
- [ ] P0 Current-project foundations are linked.
- [ ] P0 Human decision boundary is clear.
- [ ] P0 No simulation is described as deployed future capability.

## Agent system

- [ ] P0 Mission presets.
- [ ] P0 Custom objective.
- [ ] P0 Clarifier.
- [ ] P0 Researcher.
- [ ] P0 Architect.
- [ ] P0 Builder.
- [ ] P0 Governor.
- [ ] P0 Task decomposition visible.
- [ ] P0 Shared memory visible.
- [ ] P0 Evidence log.
- [ ] P0 Confidence/uncertainty.
- [ ] P0 Agent disagreement or review case.
- [ ] P0 Autonomy selector.
- [ ] P0 Approve, Revise, Reject.
- [ ] P0 Ask Why.
- [ ] P0 Stable deterministic baseline without AI.

## R3F

- [ ] P0 Nodes and handoffs communicate state.
- [ ] P0 Evidence remains readable in DOM.
- [ ] P1 Connections react to mission steps.
- [ ] P1 Performance adapts particle/node density.
- [ ] P0 Scene remains understandable in Lite mode.

## Transition/accessibility/mobile

- [ ] P0 Agent merge to 2040.
- [ ] P0 Reduced-motion fallback.
- [ ] P0 Semantic step list mirrors graph.
- [ ] P0 Human gate works by keyboard.
- [ ] P0 Mobile uses evidence sheets and clear controls.

## Tests

- [ ] P0 Preset mission E2E.
- [ ] P0 Custom objective E2E.
- [ ] P0 Approve/revise/reject.
- [ ] P0 Evidence source links.
- [ ] P0 Offline/deterministic mode.
- [ ] P1 Memory handoff to Echo.

**Done when:** the visitor can see how intent becomes coordinated work with evidence and human judgment, while understanding what is projection versus current reality.

---

# Page H — 2040 Kevin Echo

## Disclosure and identity

- [ ] P0 Explicit speculative-representation disclosure.
- [ ] P0 “Contact the biological Kevin” language is available.
- [ ] P0 Verified and speculative content are distinguishable.
- [ ] P0 Source-integrity explanation exists.
- [ ] P0 No consciousness-transfer claim.

## Interaction

- [ ] P0 Prompt chips.
- [ ] P0 Free-text thought input.
- [ ] P0 Send/interpret state.
- [ ] P0 Concise response.
- [ ] P0 Expanded response.
- [ ] P0 Memory shards.
- [ ] P0 Project/evidence actions.
- [ ] P0 Transcript.
- [ ] P0 Optional voice permission.
- [ ] P0 Voice can be stopped immediately.
- [ ] P0 Static/no-WebGL equivalent.

## R3F

- [ ] P0 Abstract hologram is recognizable but not misleading.
- [ ] P0 Memory shards react to relevant response.
- [ ] P1 Voice/resonance influences visuals.
- [ ] P1 Quality tiers reduce point/particle count.
- [ ] P0 Reduced motion removes fragment rushes.

## Closing

- [ ] P0 View Kevin’s Work.
- [ ] P0 Contact Kevin.
- [ ] P0 Return to 1990.
- [ ] P0 Timeline.
- [ ] P0 Review artifacts.
- [ ] P1 Final synthesis appears after enough exploration but is never required.

## Tests

- [ ] P0 Disclosure visible.
- [ ] P0 Prompt and free-text paths.
- [ ] P0 Source-backed project response.
- [ ] P0 Voice permission.
- [ ] P0 Static fallback.
- [ ] P0 Portfolio transition.

**Done when:** the experience feels reflective and futuristic while remaining honest about what Kevin Echo is and returning the visitor to real, present-day evidence.

---

# Page I — Portfolio `/portfolio`

## Content

- [ ] P0 Clear positioning headline.
- [ ] P0 Short explanation.
- [ ] P0 Selected projects.
- [ ] P0 Capability groups.
- [ ] P0 Experience snapshot.
- [ ] P0 How Kevin works.
- [ ] P0 Timeline summary.
- [ ] P0 Resume and Contact CTAs.
- [ ] P0 No placeholder or unsupported claims.

## UX

- [ ] P0 Useful without JavaScript.
- [ ] P0 Responsive.
- [ ] P0 Clear hierarchy.
- [ ] P0 One-click project access.
- [ ] P0 One-click timeline access.
- [ ] P1 Personal yet professional visual continuity.

## SEO/accessibility/performance

- [ ] P0 Metadata and structured data.
- [ ] P0 Semantic headings.
- [ ] P0 Core Web Vitals targets.
- [ ] P0 Print/share.
- [ ] P0 Keyboard and screen reader.

## Tests

- [ ] P0 Recruiter E2E.
- [ ] P0 Links.
- [ ] P0 Structured data validation.
- [ ] P0 No-JS snapshot.

**Done when:** a visitor can understand Kevin, see evidence, and take the next step in under two minutes.

---

# Page J — Work `/work`

- [ ] P0 Search works.
- [ ] P0 Filters work and are URL-shareable where practical.
- [ ] P0 Project cards include problem, role, evidence, and tags.
- [ ] P0 Empty state helps.
- [ ] P0 Clear all filters.
- [ ] P0 Canonical links.
- [ ] P0 Responsive.
- [ ] P0 Keyboard accessible.
- [ ] P0 Metadata.
- [ ] P0 Search/filter E2E.
- [ ] P1 Era presentation links are optional and clearly secondary.

**Done when:** a visitor can find relevant proof quickly without knowing project names.

---

# Page K — Project `/work/[project-slug]`

- [ ] P0 Executive summary.
- [ ] P0 Problem/opportunity.
- [ ] P0 Context and constraints.
- [ ] P0 Kevin’s role.
- [ ] P0 Approved collaborators.
- [ ] P0 Approach.
- [ ] P0 Key decisions.
- [ ] P0 System/workflow.
- [ ] P0 Execution.
- [ ] P0 Outcomes and evidence.
- [ ] P0 Artifacts.
- [ ] P0 Learnings.
- [ ] P0 Next opportunity.
- [ ] P0 Related work.
- [ ] P0 Contact CTA.
- [ ] P0 Source/trust checks.
- [ ] P0 No invented metrics.
- [ ] P0 Social metadata.
- [ ] P0 Print.
- [ ] P0 Accessible media.
- [ ] P0 Deep link from eras.
- [ ] P0 Project E2E.
- [ ] P1 Era adapter preview.

**Done when:** the page can independently prove Kevin’s contribution without requiring the immersive context.

---

# Page L — Resume `/resume`

- [ ] P0 Quick view.
- [ ] P0 Full chronology.
- [ ] P0 Capabilities.
- [ ] P0 Selected projects.
- [ ] P0 Print.
- [ ] P0 Download.
- [ ] P0 Contact.
- [ ] P0 No invented titles/dates.
- [ ] P0 Semantic HTML.
- [ ] P0 No-JS.
- [ ] P0 Mobile.
- [ ] P0 Print stylesheet.
- [ ] P0 Resume E2E.

**Done when:** a recruiter can scan, print, or download a trustworthy resume immediately.

---

# Page M — About `/about`

- [ ] P0 Personal introduction.
- [ ] P0 Technology origin.
- [ ] P0 How Kevin thinks.
- [ ] P0 Problems that energize Kevin.
- [ ] P0 Collaboration philosophy.
- [ ] P0 Current focus.
- [ ] P0 Six-era summary.
- [ ] P0 Contact CTA.
- [ ] P0 Approved image/alt if used.
- [ ] P0 Evidence-safe language.
- [ ] P0 Semantic headings.
- [ ] P0 Mobile.
- [ ] P0 About-route E2E.

**Done when:** the page feels personally specific, professionally useful, and factually approved.

---

# Page N — Contact `/contact`

## Form

- [ ] P0 Intent selector.
- [ ] P0 Name.
- [ ] P0 Email.
- [ ] P0 Message.
- [ ] P0 Optional project context.
- [ ] P0 Client and server validation.
- [ ] P0 Spam/rate protection.
- [ ] P0 Success state.
- [ ] P0 Error/retry state.
- [ ] P0 Privacy copy.
- [ ] P0 Accessible labels/errors.
- [ ] P0 No analytics collection of message body.
- [ ] P0 Non-JS or direct-email fallback.
- [ ] P0 Context query parameters work.
- [ ] P0 Contact E2E.

**Done when:** a qualified visitor can contact Kevin confidently from any journey with clear expectations and reliable submission.

---

# Page O — Settings and Accessibility

- [ ] P0 Sound control.
- [ ] P0 Motion: Full/Reduced/Minimal.
- [ ] P0 Quality: Auto/High/Standard/Lite.
- [ ] P0 Captions.
- [ ] P0 Keyboard guide.
- [ ] P0 Accessible scene map.
- [ ] P0 Reset settings.
- [ ] P0 Reset progress with confirmation.
- [ ] P0 Explain WebGL fallback.
- [ ] P0 Settings persist.
- [ ] P0 Controls reachable from every era.
- [ ] P0 Settings E2E.

**Done when:** visitors can tailor the experience without losing content or needing technical knowledge.

---

# Page P — Error, loading, and fallback states

## Loading

- [ ] P0 Era-specific loading language.
- [ ] P0 Semantic status.
- [ ] P0 Cancel/return option on long load.
- [ ] P0 No fake indefinite progress.
- [ ] P1 Adjacent preload is invisible unless needed.

## Error

- [ ] P0 Scene failure falls back to semantic era summary.
- [ ] P0 Retry.
- [ ] P0 Return to timeline.
- [ ] P0 Portfolio.
- [ ] P0 Error details are not exposed to public users.
- [ ] P0 Errors are logged safely.

## 404

- [ ] P0 Clear missing-page message.
- [ ] P0 Timeline, Work, Portfolio, Contact links.
- [ ] P1 Era-authentic optional treatment without obscuring navigation.

## Tests

- [ ] P0 Asset failure.
- [ ] P0 WebGL failure.
- [ ] P0 API failure.
- [ ] P0 Offline.
- [ ] P0 404.

**Done when:** failures become recoverable states rather than dead ends or broken cinematic screens.
