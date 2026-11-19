---
paths:
  - 'apps/web/src/next/**'
  - 'apps/web/src/shared/**'
  - 'libs/design-system/**'
---

# Angular in the new interface and the design system

## Components

- Standalone by default (never `standalone: true`), `changeDetection: ChangeDetectionStrategy.OnPush`
  written on every component (ESLint checks it in the library).
- Angular style guide names: `home.ts`, `home.html`, class `Home`; `session-guard.ts`; `next.routes.ts`.
- `input()`, `input.required()`, `output()`, `model()`; dependencies by `inject()`; host bindings and
  listeners in the `host` object, never `@HostBinding` or `@HostListener`.
- A component lives in its own folder, its template in `<name>.html` (empty for a styled host) and
  its styles in `<name>.scss` (none when it has no style), never inline: a folder with them is a
  component at a glance. A directive is a file.
- A template made of text alone wraps it in `<ng-container>`: the line break that ends the file
  would otherwise become a space at the end of the text.
- Interactive patterns come from the CDK (dialog, overlay, a11y) and Angular Aria (menu, tabs, listbox,
  combobox, tree), never written by hand.

## Signals and change detection

- `signal()` for state, `computed()` for what derives from it, pure. An `effect()` reads only what
  starts it and writes under `untracked()`.
- The app runs with zone.js. A signal written outside the zone (in `afterNextRender`, a third-party
  callback) does not refresh the view by itself.

## Templates

- `@if`, `@for`, `@switch`; `[class.x]`, `[style.x]`. Formatting in a pipe or a view function, never a
  method called from the template.
- Content projected into a named slot (`<ng-content select="[x]">`) must be the single root element of
  its `@if` or `@for` block, or it lands in the default slot; wrap several in
  `<ng-container ngProjectAs="[x]">`.
- `tsc` does not check templates: `nx run web:build:production` is the gate after a template or an
  input change.
- A template reference on an element that hosts a component (`<button plButton #x>`) names the
  component: query its element with `viewChild('x', { read: ElementRef })`.
