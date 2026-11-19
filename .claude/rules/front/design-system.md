---
paths:
  - 'libs/design-system/**'
  - 'apps/web/src/next/**/*.scss'
  - 'apps/web/src/next/**/*.html'
---

# Design system and styles

## The library

- `@platon/design-system`, prefix `pl-`, English throughout. It imports no PLaTon code (ESLint): the
  application passes data, and French labels, through inputs or injection tokens.
- One folder per component: `<name>.ts`, `.html`, `.scss`, `.spec.ts`, `.stories.ts`; each file
  exported from `src/index.ts`. A family shares the folder of its main component, which holds the
  family's spec and stories, each other member in its subfolder (`cover/cover-item/`), a directive
  as a file (`menu/menu-trigger.ts`). A component on a native element keeps the attribute form
  (`button[plButton]`).
- A component that links to a page uses `routerLink` (the router is not PLaTon code), so that an
  address of the current interface goes through the bridge in one reload.
- Between two hosts of the same component, `:host(:not(:first-child))`: `:host + :host` matches
  nothing under Angular's emulated encapsulation.
- Every story renders in light and dark without an axe violation (the Storybook preview fails on one).

## Tokens

- The source of truth is `src/styles/tokens.scss`, shown in Storybook under Foundations/Tokens. Scales
  are numbered (`--pl-space-4`), roles are named (`--pl-color-primary`, `--pl-radius-card`); a
  component uses roles. A missing role is added to `tokens.scss` with its dark value, never invented
  inline.
- No raw color, font, radius, shadow, layer, duration or spacing, no wireframe name (`--color-*`):
  `yarn lint:tokens`. A selector the template cannot produce is dead: `yarn lint:dead-css`.
- Icons come from the sprite built out of `icons/*.svg` and `icon-names.ts`
  (`nx run design-system:icons`); `yarn lint:icons` fails when the sprite is stale.

## Accessibility (part of done)

- Every interactive element is reachable and usable by keyboard, with a visible focus.
- An icon-only button has a name (`aria-label` or `plTooltip`), and a visible label is part of the
  accessible name.
- A message that appears is announced through the CDK `LiveAnnouncer`; a status region inserted with
  its text is not read by every screen reader.
- Contrast holds in both themes; the cover is dark in both.
- When the element holding the focus goes away with what it acts on, the focus moves to a neighbour
  or to the close button of its dialog, never to the page underneath.
- CDK overlays sit in the browser top layer, ranked by the order they show: what must appear above an
  open dialog (a menu, the toasts) shows itself again; `z-index` does nothing there.
