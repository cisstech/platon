---
paths:
  - 'apps/web/src/next/**'
  - 'apps/web/src/ui-switch/**'
  - 'apps/web/src/shared/**'
  - 'libs/design-system/**'
---

# New interface and design system

The new interface is built beside the current one (`apps/web/src/app`), which stays untouched. The plan
and the decisions live in `docs/backlog/` (French); the wireframes in `design/flows/`.

## Where code goes

- `apps/web/src/main.ts` and `ui-switch/`: choose the interface before Angular boots. No Angular there.
- `apps/web/src/shared/`: what both interfaces boot with (providers, boot context).
- `apps/web/src/next/`: the new interface. `core/` for services and guards, `pages/<route>/` for screens,
  `shared/` for components several screens use with their French copy (`load-state`).
- `libs/design-system` (`@platon/design-system`, prefix `pl-`): components and tokens. It imports no
  PLaTon code; the application passes data through inputs.

## Screen architecture

- API service: stateless, reuses the `@platon/feature/*/browser` services, which import no UI vendor.
  Import them through a light entry point, never a library's main entry, which pulls in its components
  and vendors: `@platon/core/browser/shared` for the core (ESLint enforces it); a feature library gets
  its own `.../shared` entry the first time a screen needs it.
- Store: one per route, provided by the route, signals with an `idle | loading | ready | error` state.
  The shell store is the exception: what it loads only decorates the frame, so a failure hides it.
- View functions: pure, in `<name>.vm.ts`, tested alone.
- Page: reads the store and renders; no business logic in the template.
- Cross-cutting facades (`DialogService`, theme) are ports: the new interface provides its own
  implementation in `next.config.ts`.

## Components

- Standalone, signal inputs, OnPush (the Angular 22 default: never opt out), default encapsulation,
  never `ViewEncapsulation.ShadowDom`.
- Angular style guide names: `home.ts`, `home.html`, `home.scss`, class `Home`; `legacy-bridge-guard.ts`
  for a guard; `next.routes.ts` for configuration.
- Build interactive patterns on the Angular CDK (dialog, overlay, a11y) and Angular Aria (menu, tabs,
  listbox, combobox, tree) rather than by hand.
- Never import `ng-zorro-antd`, `@angular/material`, `@platon/shared/ui`, `apps/web/src/app` or the main
  entry of `@platon/core/browser`: ESLint rejects it.

## Styles

- Every value comes from a `--pl-*` token (`libs/design-system/src/styles/tokens.scss`, Storybook page
  Foundations/Tokens). Components use roles (`--pl-color-primary`, `--pl-radius-card`,
  `--pl-font-body`); scales are numbered (`--pl-space-4`, `--pl-plum-700`).
- No invented token, no wireframe name (`--color-*`, `--spacing-*`), no raw color, font, radius, shadow,
  layer, duration or spacing: `yarn lint:tokens` rejects them.
- A class in a component stylesheet appears in its template: `yarn lint:dead-css`.

## Language

- Code, comments, Storybook stories and library docs: English.
- UI copy of the application: French, formal "vous", gender neutral.
- Never an em dash or en dash: `yarn lint:em-dashes`.

## Before handing over

`yarn lint:design`, then `nx run-many -t lint,test -p web design-system tools-lint` and
`nx build-storybook design-system`.
