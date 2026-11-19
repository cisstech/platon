---
paths:
  - 'docs/backlog/**'
---

# Delivering a ticket

A ticket of `docs/backlog/` is delivered layer by layer, tests first, the gate of each layer green
before the next one starts. The gates and their commands are in `CLAUDE.md`.

## Layers, in order

| Layer                                                                              | Gate                                      |
| ---------------------------------------------------------------------------------- | ----------------------------------------- |
| Contracts in `libs/**/common` (additive)                                           | lint and test of the library              |
| API: entity, generated migration, service, controller, DTO                         | unit and integration specs, API types     |
| Browser access: the library's light `/shared` entry                                | ESLint boundaries of `web`                |
| Design system: component, spec, stories in light and dark                          | test, `yarn lint:design`, Storybook build |
| New interface: API service, route store, view functions, page, route, ported paths | test, lint, production build of `web`     |

Tests first for each layer: view functions, stores, components, services, and an integration spec
for any SQL. A test already green proves nothing. Integration and e2e specs start containers
(testcontainers): the person runs them, or the CI of a pull request to `main`.

## Verify for real

- Every new or changed story: axe in light and dark, no violation.
- The screen on the production build, with a fake API from a scratch script or on the person's
  running app at `https://localhost`: phone width and dark theme when it shows, keyboard path, focus
  after each dialog, screenshots looked at and compared to the wireframe in `design/flows`.
- Parity with the current interface: the functions of the current screen are ticked, or each gap is
  a decision.

## Review

Three read-only reviewers in parallel, each with the ticket, the change set and one dimension. Each
finding is checked against the code before it is fixed; a rejected one is reported with its reason.

- Front: the rules of `front/`; signals and zone.js, the store per route, light `/shared` entries,
  tokens and only them, the design system in English with no PLaTon word, accessibility (keyboard,
  focus after a dialog, names, live announcements), French copy in the new interface.
- Back: the rules of `back/`; the owner in every `WHERE`, parameters in SQL, a body never copied
  whole onto an entity, an integration spec for each query, generated migrations, additive contracts.
- Consistency: a helper that repeats one that exists or sits away from its kind, a ticket claim the
  code contradicts, docs and rules still true, tests that narrate history or restate the code, dead
  code left behind.

Checks that caught real defects here:

- A row owned by a person, deleted or changed by its id alone; a key unique only within its parent
  looked up alone.
- Two queries meant to count the same thing that drifted apart (queue versus summary).
- Content in an `@if` block lost by a named `ng-content` slot; an overlay attached before the dialog
  it opens from; a focused element moved in the DOM, which closes its menu.
- A signal written outside the zone; a full page navigation that interrupts an IndexedDB write.
- Text read by a screen reader with words run together, or a visible label missing from the name.
- A test that passes on CI only, or locally only (environment variables such as `CI`).

## Closing

The ticket moves to `done/` with its status, its boxes ticked and what was not verified said plainly;
what changed on the way is added as quotes (`> **Amendement à la livraison.**`,
`> **Défaut trouvé en chemin.**`), and `ROADMAP.md` follows. A bug found on the way goes to
`design/docs/08-bugs.md`; a durable lesson to the relevant rule, in one line. Report in French.
Commit only when asked. Stacked branches stay linear, each rebased on the one below and never merged
into it: GitHub rebases a stacked pull request when it merges it.
