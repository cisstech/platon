---
paths:
  - 'apps/web/src/app/**'
  - 'libs/**/browser/src/**/components/**'
  - 'libs/shared/ui/**'
---

# Current interface

The current interface (Material, ng-zorro, `@platon/shared/ui`) is replaced screen by screen by the new
one, then removed with its vendors (ROADMAP, phase X).

- It receives fixes only: the smallest change that fixes the bug, in its own style. No new screen, no
  refactor, no new dependency, no restyling.
- It never imports from `apps/web/src/next`. What both interfaces need lives in `apps/web/src/shared` or
  in a library's light `/shared` entry.
- A fix that also concerns the new interface is made once, in the shared service or the API.
