# Kevinception V7 — Known Limitations

- The six 3D environments use procedural geometry. They establish composition, interaction, lighting, camera, and art direction, but are not final bespoke asset production.
- Screen transitions use camera choreography and authored full-screen effects. High-tier render-to-texture portals remain future work.
- The functional era applications are embedded from the V6 static build. A later refactor may move each application into native React packages while retaining the same contracts.
- AI conversations remain deterministic because no secure server-side retrieval/LLM endpoint has been configured.
- Portfolio facts remain evidence-safe and generalized where exact chronology or metrics were not confirmed.
- Environmental audio is limited to synthesized interface feedback; final original sound design is not included.
- Browser runtime screenshots were not generated in the hosted build environment because Chromium navigation is administrator-blocked there. A local cross-platform runtime script is included.
