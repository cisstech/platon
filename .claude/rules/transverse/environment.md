---
paths:
  - '**/*'
---

# Shell, tooling, dev environment

- Node is pinned by `.nvmrc` and a non-interactive shell does not load nvm: run
  `source ~/.nvm/nvm.sh && nvm use` in the same command as any `node`, `npx`, `yarn` or `nx`. A wrong
  Node shows up as misleading ESM or module errors, not as a version error.
- An ambient `NX_WORKSPACE_ROOT_PATH` points nx at another workspace on this machine and makes it
  report success on the wrong repository: prefix nx with `env -u NX_WORKSPACE_ROOT_PATH`, and add
  `NX_DAEMON=false NX_TUI=false` for non-interactive runs.
- Yarn comes from `yarnPath` in `.yarnrc.yml` (no corepack). Install with `yarn install`, never npm.
- The app runs at `https://localhost` behind the nginx container, which sends `/api` to the API. The
  Angular dev server port has no API proxy: signing in there fails without a message.
- Containers (`docker-compose.dev.yml`) and dev servers (`yarn serve:*`) are started by the person.
  Never start or stop them, and never run `nx run api:build` while the API is served: both write
  `dist/apps/api` and the dev API dies. Check API types with `tsc --noEmit` instead.
- Integration and e2e specs start their own containers (PostgreSQL, Redis) (testcontainers): CI runs them
  (`affected:test:integration`, `affected:test:e2e`); locally, hand the command to the person.
- A temporary git worktree keeps the person's tree untouched (another branch, a fix on a base
  branch); symlink `node_modules` into it and remove both afterwards.
- Format the files you touched (`npx prettier --write <files>`), never a whole folder: it reformats
  files others are working on.
