# Kevinception voice and naming

- **Status:** Active editorial contract
- **Owner:** Kevin approves facts; agents apply the voice
- **Last audit:** 2026-08-10; glossary updated for 0.9.0 names

## The voice

Kevinception sounds like a curious systems builder speaking directly to one person. The default is first person (`I`, `my`) for Kevin's ideas, methods, and invitations; second person (`you`) when helping the visitor choose a path. Sentences are plain-spoken, specific, and confident without hype.

Use short statements to create rhythm. Explain the concrete action before naming the abstract discipline. Prefer “the choices that have to be made” to “the decision surface,” and “the information an AI tool needs” to “context logistics” on a first mention.

Third person is reserved for neutral metadata, conventional resume/case-study evidence, chapter narration, and attributed material. Product names are not third-person self-reference.

## Tone controls

- **Curious, not cryptic.** A line may open a question; the next line makes the path clear.
- **Ambitious, not inflated.** Do not use “best,” “revolutionary,” or award claims without evidence.
- **Technical when useful.** Name an implementation detail only when it helps someone understand a decision or result.
- **Human, not corporate.** Prefer “I start with the real objective” to “objectives are aligned.”
- **Evidence-safe.** Never invent dates, metrics, employers, credentials, clients, testimonials, or outcomes.

## Naming glossary

| Name | Meaning | Usage |
|---|---|---|
| **Kevinception** | The public site and its six-era experience | Use without a version number in visitor copy. |
| **the Kevinception build** | The project described in the Kevinception case study | Use when the site and the work of building it could be confused. |
| **Timeline** | The immersive route at `/experience/` | Global navigation label. “Chapters” is allowed inside the experience for its chapter chooser. |
| **About** | Kevin's origin, approach, and capabilities at `/about/` | Global navigation label. The former Profile page (`/portfolio/`) is merged here and `/portfolio/` redirects permanently to `/about/`. |
| **Case studies** | The project archive at `/work/` | The only surface that lists every project card. |
| **Curiosity / Connection / Commerce / Creation / Co-Existence / Consciousness** | The six chapter names (1990–2040) | Lead with these on the landing page, timeline, and chapter cards. Defined once in `src/content/narrative.ts`. |
| **KevinVision / Kevin Online / StealStreet Commerce OS / KevTok / Morning, Together / Morning, After** | The in-world experience for each chapter | Keep exact capitalization and punctuation (the comma in “Morning, Together”). Pair with the chapter name in environment labels. |
| **Saito** | The 2030 household intelligence in Morning, Together | A first-person conversational counterpart, not an assistant brand. Consequential actions always stop at Kevin's hand. |
| **holographic Kevin** | The 2040 figure in Morning, After | An authored reproduction built from permissioned memory, not transferred consciousness. Keep that disclosure wherever the figure speaks. |
| **TokenPak / TIP / PAK** | Real infrastructure projects shown as 2030 provenance | Appear only in the optional infrastructure receipt, never as the lead of the scene. |

Retired names: KevinBook and Kevazon Marketplace (2010), Kevin Nexus (2030), and Kevin Echo (2040). Do not use them in visitor copy; they survive only in archived planning documents and internal identifiers such as file names.

## Plain-language glossary

| Internal shorthand | First public mention |
|---|---|
| context logistics | packaging and routing the information AI tools need |
| decision surface | the choices, constraints, and tradeoffs that have to be made |
| canonical content | one shared source of truth |
| human in the loop | a human approval or review step |
| R3F / WebGL | 3D experience; name the technology only in technical case-study detail |

## Route audit

| Surface | Voice check |
|---|---|
| Home | First-person invitation; direct routes named by visitor intent. |
| Case studies | Neutral evidence voice; project claims remain limited to the existing source facts. |
| Resume | Conventional implied-first-person action language; unconfirmed dates and credentials remain guarded in source. |
| About | First-person origin, working method, positioning, and current work; no duplicate project archive. |
| Contact | First-person instructions and a direct email action. |
| Timeline | Deliberate third-person chapter narration, with plain labels for controls and fallback routes. |

The 2026-08-10 audit replaced visitor-facing uses of “decision surface,” “context logistics,” “human-in-the-loop,” “canonical facts,” and “no-WebGL” with plain language on their first appearance. It also separated Profile from Case studies in navigation and content. Kevin-gated facts, portrait, social proof, and dates remain absent rather than fabricated.
