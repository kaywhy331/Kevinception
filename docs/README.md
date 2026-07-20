# Kevinception V7 — Master Product & Technical Specification Package

**Product owner:** Kevin Yang  
**Version:** 7.0 planning baseline  
**Date:** July 20, 2026  
**Architecture direction:** R3F-first hybrid experience  
**Primary domain:** kevinception.com

This package consolidates the approved six-year technology timeline, the V7 storyboard, the R3F-first architecture decision, the Kevin Online/AOL/Xanga requirements, the cross-era continuity model, and implementation-ready completion criteria.

## Authoritative order

1. `00_OVERARCHING_GOAL.md`
2. `01_PRODUCT_REQUIREMENTS_DOCUMENT.md`
3. `02_TECHNICAL_SPECIFICATION.md`
4. `03_CROSS_TIMELINE_INTERACTION_SPEC.md`
5. `04_PAGE_COMPLETION_CHECKLISTS.md`
6. `KEVINCEPTION_V7_MASTER_SPEC.md` — combined reference

When documents appear to conflict:

- The **PRD** controls product behavior and user outcomes.
- The **Technical Specification** controls architecture and implementation contracts.
- The **Cross-Timeline Specification** controls continuity and transition behavior.
- The **Completion Checklists** control release acceptance.
- Canonical content records control all factual claims about Kevin.

## Core decision

Kevinception is built as a **single persistent React Three Fiber experience** for the immersive journey, while content-heavy applications and canonical portfolio pages remain semantic React/HTML.

```text
R3F / Three.js
  environment, physical devices, camera, lighting,
  spatial audio, transitions, artifacts, holograms

React DOM
  AOL windows, mail, chat, Xanga, KevinBook, KevTok,
  case studies, resume, forms, captions, transcripts

Canonical content
  one verified source of biography, experience,
  capabilities, projects, evidence, memories, media

State and routing
  continuity, discoveries, interface state, direct URLs,
  returning visits, reduced-motion and quality modes
```

The visitor should perceive one continuous world, but the product must remain readable, searchable, accessible, shareable, and useful as a portfolio.
