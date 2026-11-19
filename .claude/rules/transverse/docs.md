---
paths:
  - 'docs/**'
  - 'design/**'
  - 'CLAUDE.md'
  - '.claude/**'
---

# Backlog, design docs and these rules

- French, formal and plain, no em or en dash (`yarn lint:em-dashes` covers `docs/backlog`,
  `design/docs` and the rules).
- A ticket follows the template of `docs/backlog/README.md`. Delivered, it moves to `done/` with
  `Statut : Livré (date)`, its boxes ticked, and what changed during the work written as
  `> **Amendement à la livraison.**` paragraphs; `ROADMAP.md` gets the new status in the same change.
- A decision is never edited in place: a new dated line in `DECISIONS.md` replaces it.
- A bug found in the code goes to `design/docs/08-bugs.md` with its symptom, cause, place and lead,
  and its box is ticked when the fix is merged.
- `design/flows/` and `design/spec/` are wiresmith sources: never reformat them (Prettier skips them).
- A rule file stays short, states invariants and points to where the truth lives. When the code
  changes a convention, the rule changes in the same change.
