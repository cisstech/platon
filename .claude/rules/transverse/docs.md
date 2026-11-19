---
paths:
  - 'docs/**'
  - 'design/**'
  - 'README.md'
  - 'CONTRIBUTING.md'
  - 'CLAUDE.md'
  - '.claude/**'
---

# Docs, backlog, design docs and these rules

- The backlog and the design docs are in French, formal and plain; the developer guides
  (`README.md`, `CONTRIBUTING.md`, the other files of `docs/`) in English. No em or en dash in any of
  them: `yarn lint:em-dashes` covers them all.
- A guide points to where the truth lives (a script, `package.json`, a template, a reference library,
  a real spec) instead of copying a list, a version or a configuration, which would go stale.
- A ticket follows the template of `docs/backlog/README.md`. Delivered, it moves to `done/` with
  `Statut : Livré (date)`, its boxes ticked, and what changed during the work written as
  `> **Amendement à la livraison.**` paragraphs; `ROADMAP.md` gets the new status in the same change.
- A decision is never edited in place: a new dated line in `DECISIONS.md` replaces it.
- A bug found in the code goes to `design/docs/08-bugs.md` with its symptom, cause, place and lead,
  and its box is ticked when the fix is merged.
- `design/flows/` and `design/spec/` are wiresmith sources: never reformat them (Prettier skips them).
- A rule file stays short, states invariants and points to where the truth lives. When the code
  changes a convention, the rule changes in the same change.
