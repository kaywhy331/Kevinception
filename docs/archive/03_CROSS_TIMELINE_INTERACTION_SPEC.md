# 03 — Cross-Timeline Interaction Specification

## 1. Purpose

The cross-timeline system is the functional expression of the “Kevinception” name.

Without it, the project is six themed pages. With it, the visitor experiences:

- Interfaces inside interfaces.
- Objects that change meaning over time.
- Actions that create later consequences.
- Technology evolving while Kevin’s underlying patterns persist.
- A story that can be entered from any year but becomes richer when followed across years.

The continuity system must remain understandable and optional. It may reward exploration, but it cannot gate essential content.

---

## 2. Narrative progression

```text
1990 — Wonder
Screens can be controlled. Rules can be learned. Worlds can be explored.
        ↓
2000 — Connection
Networks make identity, experimentation, and discovery social.
        ↓
2010 — Participation
A digital self becomes visible to communities and professional networks.
        ↓
2020 — Creation
Ideas become compressed media, products, systems, and public signals.
        ↓
2030 — Orchestration
Intent is delegated to intelligent collaborators with evidence and human gates.
        ↓
2040 — Continuity
Knowledge, memories, and values become an interpretable digital representation.
        ↓
Present-day portfolio
The biological Kevin, current work, evidence, and contact.
```

---

## 3. Transition matrix

| From | To | Visual bridge | Audio bridge | Conceptual bridge |
|---|---|---|---|---|
| Threshold | Timeline | Six rings become a technology path | Layered tones resolve into a pulse | Choice becomes exploration |
| Timeline | 1990 | TV silhouette gains depth and powers on | Relay click and static | Technology as wonder |
| 1990 | 2000 | Static expands through TV glass into CRT scanlines | Static becomes modem handshake | Control becomes connection |
| 2000 | 2010 | Xanga/profile media fills screen and flattens into a social profile | Mail/IM tone becomes notification | Online identity becomes public identity |
| 2010 | 2020 | Video rotates from landscape display to portrait phone | Notification rhythm becomes a beat | Participation becomes creation/distribution |
| 2020 | 2030 | Captions, comments, and reactions become task/context nodes | Beat becomes processing pulse | Content signals become machine-readable intent |
| 2030 | 2040 | Agent memories converge into a human-shaped field | Agent pulses become resonance | Coordinated intelligence becomes preserved perspective |
| 2040 | Portfolio | Hologram resolves into real content and photography | Resonance fades to quiet room tone | Speculation returns to present evidence |

Reduced motion replaces camera tunneling and object rushes with short crossfades and equivalent audio/text cues.

---

## 4. Persistent artifact system

A small number of artifacts recur. Recommended launch set: five.

### Artifact A — Signal Fragment

| Year | Form |
|---:|---|
| 1990 | Game collectible |
| 2000 | Downloaded `.sig` file |
| 2010 | Tagged image or hidden Note |
| 2020 | Saved draft asset |
| 2030 | Context packet |
| 2040 | Memory shard |

Narrative meaning: curiosity and continuity across interfaces.

### Artifact B — Identity Handle

| Year | Form |
|---:|---|
| 1990 | High-score initials |
| 2000 | Screen name |
| 2010 | Profile identity |
| 2020 | Creator handle |
| 2030 | Actor/agent identity record |
| 2040 | Identity reconstruction key |

Narrative meaning: how digital identity becomes increasingly persistent.

### Artifact C — Project Blueprint

| Year | Form |
|---:|---|
| 1990 | Cartridge manual diagram |
| 2000 | Zip archive / attachment |
| 2010 | Note or album |
| 2020 | Behind-the-scenes clip |
| 2030 | Architecture/evidence graph |
| 2040 | Reconstructed project memory |

Narrative meaning: ideas become systems and evidence.

### Artifact D — Message From the Next Layer

| Year | Form |
|---:|---|
| 1990 | Scrambled Channel 13 transmission |
| 2000 | Mail/IM from unknown account |
| 2010 | Future-dated wall notification |
| 2020 | Comment from an impossible account |
| 2030 | Handoff from unregistered agent |
| 2040 | Message attributed to present-day Kevin |

Narrative meaning: later layers leak into earlier ones.

### Artifact E — Human Gate

| Year | Form |
|---:|---|
| 1990 | Player choice at tower |
| 2000 | Confirm download / sign off |
| 2010 | Publish or keep private |
| 2020 | Post or save as draft |
| 2030 | Approve, revise, reject |
| 2040 | Preserve, reinterpret, or forget |

Narrative meaning: technology expands capability, but human judgment remains central.

---

## 5. Artifact state

```ts
type ArtifactState = {
  discovered: boolean;
  firstDiscoveredYear?: EraYear;
  formsSeen: EraYear[];
  choices: Record<string, string>;
  lastUpdatedAt?: string;
};
```

Rules:

- Discovery is local to the visitor.
- Artifact state can change presentation and optional dialogue.
- It cannot change canonical factual content.
- Every artifact has an accessible discovery path.
- Reset is available.
- No account is required.

---

## 6. Cross-era cause and effect

### 6.1 1990 → later eras

- Completing the game records the three fragments.
- The 2000 desktop may show a recovered file.
- The 2010 profile may contain an old game image.
- The 2020 feed may use a fragment as a motion asset.
- The 2030 system may recognize the fragment as an early context schema.
- The 2040 memory graph may show it as the first memory.

### 6.2 2000 → later eras

- Xanga skin choice can influence the color treatment of a 2010 album, within accessibility limits.
- A saved K-Mail attachment appears as a KevinBook Note or KevTok draft.
- A Buddy List interaction can determine which guide introduction appears later.
- Sign-off state does not block later access.

### 6.3 2010 → later eras

- A published local status may be reformatted as an archived 2020 clip title.
- A liked project can be prioritized in the 2020 feed.
- A privacy choice becomes a 2030 human-gate example.
- A photo can appear as a 2040 memory shard.

### 6.4 2020 → later eras

- Saved clips become 2030 context packets.
- A comment about a problem can seed a mission objective.
- A draft-versus-publish choice becomes a human-approval example.
- Interaction categories influence recommended projects, not factual results.

### 6.5 2030 → 2040

- Approved agent summaries become Echo memories.
- Rejected plans appear as alternate branches, clearly labeled.
- Evidence sources remain linked.
- Autonomy setting influences visual storytelling only; it does not imply a real future preference unless Kevin confirms it.

### 6.6 2040 → present

- Kevin Echo recommends canonical work and contact.
- The portfolio identifies Echo content as speculative.
- Visitors can compare “reconstructed memory” with present evidence.

---

## 7. Direct entry and non-linear exploration

The timeline is not locked.

A visitor may enter `/experience/2030` directly.

Direct-entry behavior:

1. Short establishing view.
2. Era disclosure/context.
3. Primary interaction available.
4. Optional “Start from 1990.”
5. Unknown artifacts remain unknown, but content is complete.

If a direct-entry visitor later reaches an earlier era, later knowledge may be reflected through optional dialogue but must not make the earlier era incomprehensible.

---

## 8. Transition orchestrator requirements

Each transition must coordinate:

- Route change.
- Next-scene preload.
- Interface exit.
- Camera animation.
- Object transformation.
- Audio bridge.
- Artifact state.
- Reduced-motion fallback.
- Timeout/error recovery.
- Analytics.

Failure behavior:

- If next scene fails, show semantic summary and retry.
- If high-quality asset fails, fall back to standard/lite.
- Route must not become stuck in transition.
- Browser Back returns to a stable state, not mid-animation.

---

## 9. Content continuity

The same canonical project may be presented as:

| Era | Presentation |
|---:|---|
| 1990 | Future Files broadcast |
| 2000 | Zip file, website, mail attachment |
| 2010 | Project post, Note, album |
| 2020 | Short-form clip |
| 2030 | Mission evidence and architecture graph |
| 2040 | Reconstructed memory |

The title, role, problem, decisions, and outcomes remain consistent. Only the metaphor and level of detail change.

---

## 10. Guide continuity

A guide/buddy may have era-specific manifestations, but all personas share:

- Approved content source.
- Same facts.
- Stable project IDs.
- Stable capability IDs.
- Stable conversation topics.
- Validated actions.

Personality changes framing, not truth.

Conversation continuity options:

- Default: session-only.
- Optional: visitor can save a local thread.
- Never sync private messages without explicit consent.
- When switching eras, a concise thread summary may carry forward.

---

## 11. Easter-egg governance

Each era gets three to six Easter eggs.

Every Easter egg must have:

- Era relevance.
- A reason to exist.
- A discoverable trigger.
- An accessible alternative.
- A restrained reward.
- A continuity link or meaningful joke.
- A test.
- A content/trademark review.

Avoid:

- Random logo-click counters with no narrative meaning.
- Essential content behind secrets.
- References that require proprietary assets.
- Loud surprises without volume control.
- Motion that ignores reduced-motion settings.

---

## 12. Completion conditions for continuity

Cross-era interaction is complete when:

- All five launch artifacts have forms in all six years.
- At least three artifacts visibly transform during a normal full journey.
- At least one choice in each era affects a later optional presentation.
- Browser-local progress persists and can reset.
- Direct-entry remains complete.
- Reduced-motion transitions communicate the same meaning.
- Route navigation and Back/Forward stay stable.
- Content facts do not diverge between forms.
- E2E tests cover 1990→2000, 2020→2030, and 2030→2040.
