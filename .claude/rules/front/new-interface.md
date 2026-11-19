---
paths:
  - 'apps/web/src/next/**'
  - 'apps/web/src/ui-switch/**'
  - 'apps/web/src/shared/**'
  - 'apps/web/src/main.ts'
---

# New interface: architecture

Built beside the current interface, which the person can still choose at startup. The plan, the
decisions and the delivered tickets are in `docs/backlog/`; the screens to build in `design/flows/`.

## Where code goes

- `apps/web/src/main.ts` and `ui-switch/`: choose the interface before Angular boots. No Angular there.
- `apps/web/src/shared/`: what both interfaces share (boot context, providers, ported paths, page
  navigation).
- `apps/web/src/next/`: `core/` for services, stores of the whole app and guards; `shell/` for the
  frame; `pages/<route>/` for screens; `shared/` for components several screens use with their French
  copy.
- A rule on a contract (when an activity is finished, its dates) goes to the library of the
  contract (`@platon/feature/*/common`), beside its types; `next/shared/` keeps what carries French
  copy or wires the application.
- `libs/design-system`: everything visual and reusable, without PLaTon knowledge
  (`front/design-system.md`), pure display helpers included (course hues, relative dates through
  `Intl`): in `next/` the libraries could not use them. `next/core/` is wiring of the application
  only.

## Inside a folder of `next/`

The folder says the role, the file names the concept: class `TeacherHome` in `teacher-home.ts`, no
`.component` or `.service`. A component has its own folder: its `.ts`, `.html`, `.scss`, `.spec.ts`
and `.vm.ts`, nothing else. Every page, the shell and every part of them (`shell/notifications/`)
follow the same layout (`pages/home/` is the full example):

- At the root: the entry component (the page of the route, the frame, the panel), its guard, its
  view functions (`<name>.vm.ts`), and what its views share (`home-page.ts`, `home-layout.scss`).
- `data/`: what talks to the API and holds state, with no template: API services, stores, loaders.
- `ui/`: presentational components, each in its folder, fed by inputs and answering through
  outputs; they inject no store and no API service. A dialog opened by the folder is one
  (`shell/ui/charter-dialog/`).
- One folder per view when the entry shows one of several by role (`student/`, `teacher/`): the view
  component, its template, its styles and its view functions.
- `next/shared/` keeps the same split: a helper is a file beside its spec (`plural.ts`), a component
  goes in its folder under `shared/ui/`, test helpers in `shared/testing/`.

## A screen

- API service: stateless, `providedIn: 'root'`, built on the `@platon/feature/*/browser` services
  through their light `/shared` entry. A library without one gets it, never an import of its main
  entry: ESLint rejects it, and the main entry pulls in its components and vendors.
- Store: `@Injectable()` without `providedIn`, listed in the `providers` of its route, signals and a
  status `idle | loading | ready | error`. The router keeps a route's injector from one visit to the
  next: the page starts its store afresh (state reset in its `load` or `start`) and stops it on leaving.
- View functions: pure, in `<name>.vm.ts`, tested alone. The page reads the store and renders.
- Loading and failure: `trackLoadPhase` and `app-load-state`, never an error shown as an empty state.
  A screen that does not wait for the API (the sign-in page) gives each part it loads its own status.
- Cross-cutting ports (`DialogService`, theme) get their new implementation in `next.config.ts`.
- The user comes from `Session`; routes of the frame sit under the shell, behind `sessionGuard`.

## Ported and bridged addresses

- Addresses are a contract: a ported screen keeps the route of the current interface.
- A ported route is added to `next.routes.ts`, under the shell, or at the top level without the
  session guard for a screen out of the frame (the sign-in page), and to `shared/ported-paths.ts`;
  `next.routes.spec.ts` fails if the two differ. Every other address opens in the current interface
  through the bridge; a link to a screen not ported yet is a plain `routerLink`, the bridge does the rest.
- The bridge reloads the page: a request started by the same click (marking something read) is
  awaited, briefly, before navigating, or the reload cuts it.
