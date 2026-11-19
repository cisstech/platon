# PLaTon

PLaTon is an open source learning platform: teachers write auto-graded exercises and group them into
activities inside courses, students play them, correctors grade copies, candidates take entrance tests.
Nx monorepo: NestJS API (`apps/api` and the `libs/**/server` libraries), Angular web app (`apps/web`)
with two interfaces chosen at startup: the current one (`apps/web/src/app`, Material and ng-zorro,
being replaced) and the new one (`apps/web/src/next`, on the design system `libs/design-system`).
Tool versions live in `package.json` and `.nvmrc`: read them there, never copy one into a rule.

## How instructions are organized

Path-scoped rules in `.claude/rules/` load when a matching file is read: `front/` (new interface,
design system, current interface), `back/` (API and server libraries), `transverse/` (shell and
tooling, tests, shared contracts, docs). This file holds only the repo-wide essentials.

A rule states an invariant and names where its source of truth lives (a file, a lint, a decision). It
never copies a list, a count or a version the code already holds, so it does not go stale. Existing code
that breaks a rule is debt to fix when touched, never a pattern to copy.

## Verification gates (before saying done)

Shell setup first, in the same command: `source ~/.nvm/nvm.sh && nvm use`, and `env -u
NX_WORKSPACE_ROOT_PATH NX_DAEMON=false NX_TUI=false` in front of nx (see `transverse/environment.md`).

- `yarn nx run-many -t lint,test -p <touched projects>`
- `yarn lint:design` after a change in the new interface, the design system or the docs it covers
- `yarn format:check` on the touched files (`npx prettier --check <files>`)
- `yarn nx run web:build:production` after a template or input change: `tsc` does not check templates
- API types: `npx tsc --noEmit -p apps/api/tsconfig.app.json`
- `yarn nx run design-system:build-storybook` after a library component change

## Non-negotiables

- The person starts and stops containers and dev servers; never do it, never build into what they serve.
- Commit, push or open a pull request only when asked. Never a Claude author, co-author or "Generated
  with" line. Commits: `type(scope): subject`, English, imperative, scope = library or area
  (`web`, `design-system`, `result`, `backlog`). Pull requests: a few factual sentences.
- No em or en dash anywhere, code, copy or docs: `yarn lint:em-dashes`.
- French for product copy (formal "vous", gender neutral), `docs/` and `design/`; English for code,
  comments, logs, server exceptions, commits and pull requests. User-facing error strings are French.
- A comment says what the code does and its non-obvious why: never its history, a ticket id or a
  decision id.
- The current interface only receives fixes (`front/legacy.md`); new screens go to the new one.
- Before adding a helper, decorator, pipe, type or constant, look for the one that already does the
  job, by name and by behaviour: reuse it or extend it, and replace the inline copies you touch. A new
  one lives beside its kind (casts and decorators of the API in `libs/core/server/src/lib/utils`,
  browser helpers in `@platon/core/browser/shared`, shared models in `common`), so the next search
  finds it.

## Where things live

- `docs/backlog/`: `README.md` (ticket standard), `ROADMAP.md` (where we are), `DECISIONS.md`
  (decisions in force), `done/` (delivered tickets and their amendments).
- `design/`: wireframes (`flows/`, `spec/`, wiresmith sources, never reformatted) and design docs
  (`docs/`, bugs found in `docs/08-bugs.md`).
