# PLaTon

<p align="center">
  <img src="https://raw.githubusercontent.com/cisstech/platon/main/shared/assets/images/logo/platon.svg" alt="PLaTon" width="120px" />
</p>

<p align="center">
  <a href="https://github.com/cisstech/platon/actions/"><img src="https://github.com/cisstech/platon/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://codecov.io/gh/cisstech/platon"><img src="https://codecov.io/gh/cisstech/platon/branch/main/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.codefactor.io/repository/github/cisstech/platon/overview/main"><img src="https://www.codefactor.io/repository/github/cisstech/platon/badge/main" alt="CodeFactor"></a>
</p>

PLaTon is an open source platform for learning and teaching online. Teachers write
auto-graded exercises, group them into activities and run those activities in courses; students
play them, correctors grade what needs a human eye, and candidates take entrance tests. It plugs
into Moodle and other LMS through LTI.

- What it does, for teachers and students: the [documentation](https://cisstech.github.io/platon/docs)
- The project page: [cisstech.github.io/platon](https://cisstech.github.io/platon/)

## A redesign under way

### Why

An audit of the interface in 2026 found screens that work against the people using them: a home
page that tells no one what to do, errors shown as an empty list or a loading that never ends, two
component libraries (Material and ng-zorro) mixed in the same screens, colours that mean nothing.
Patching screen by screen would not fix that, so the interface is being rebuilt.

### How

- **Beside the current interface, not in its place.** The web app ships both and picks one at
  startup; anyone can try the new one and go back. A screen the new interface does not have yet
  opens in the current one, at the same address. Everything under the screens (models, API, sign-in)
  serves both.
- **A few rules for every screen.** Say what there is to do before showing numbers; show a button
  only when an action is expected; give empty, loading and error each their own honest form; let the
  density follow the work; the same gesture always takes the same form.
- **Its own design system**, light and dark, with no Material nor ng-zorro: the new interface does
  not inherit the inconsistencies it replaces.
- **Wireframes first, then one ticket at a time**, tests first, each decision written down, so that
  people and coding agents work from the same written rules.

It ends when a person can do all their work in the new interface without meeting the current one;
then the new one becomes the default, and the current one goes, with Material and ng-zorro. Until
then, new features go to the new interface and the current one only gets fixes.

- What is done and what comes next: [`docs/backlog/ROADMAP.md`](docs/backlog/ROADMAP.md)
- The decisions behind it: [`docs/backlog/DECISIONS.md`](docs/backlog/DECISIONS.md)
- The audit, the screen rules, the plan and the wireframes: [`design/`](design/)

## Run it on your machine

You need Docker and Node, in the version of [`.nvmrc`](.nvmrc) (`nvm use` picks it). Any `yarn`
works: the repository runs the version it checks in.

```sh
yarn                          # dependencies
./bin/install.sh              # .env, the default accounts and a local certificate
./bin/docker/up.sh            # PostgreSQL, Redis, PgAdmin and nginx
./bin/migration/run.sh        # the database schema
./bin/init-db.sh              # the default accounts
yarn serve:api                # the API, in its own terminal
yarn serve:web                # the web app, in another one
```

Then open <https://localhost>, through nginx, which serves the web app and the API together. Your
browser will warn about the self-signed certificate the first time: accept it (in Chrome, type
`thisisunsafe` on the warning page). The accounts you can sign in with are in
`tools/database/init.json`, generated from [`templates/`](templates/) along with `.env`, where every
setting is listed.

The current interface opens by default. Add `?ui=next` to the address to switch to the new one, and
`?ui=legacy` to come back; the choice is remembered.

## See the screens before the code

The new interface is designed before it is built, and both stages can be browsed without running
PLaTon:

- **The wireframes** of every journey, desktop and phone, with their states, form a navigable
  canvas built with [Foundry](https://foundry.cisstech.com/docs) (in beta). Browse it
  [online](https://cisstech.github.io/platon/wireframes/), or live from `design/` while you edit it:

  ```sh
  yarn design:serve
  ```

  `design/spec/` describes what each journey does, and [`design/AGENTS.md`](design/AGENTS.md) how
  its screens are written; `yarn design:check` checks that the spec holds together.

- **The design system**, every component in each of its states, light and dark, in Storybook:

  ```sh
  yarn storybook
  ```

## Find your way around

| Where                                                  | What                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `apps/api`                                             | The NestJS API                                                     |
| `apps/web/src/app`                                     | The current interface (Angular)                                    |
| `apps/web/src/next`                                    | The new interface (Angular)                                        |
| `libs/design-system`                                   | The components of the new interface, with their Storybook          |
| `libs/{core,feature,shared}/*/{browser,server,common}` | The code of each domain, for the browser, the API, or both         |
| `docs/backlog`                                         | The tickets of the redesign, the roadmap and the decisions         |
| `design`                                               | Wireframes and their spec, art direction, bugs found along the way |
| `bin`                                                  | Scripts: Docker, migrations, database, certificates                |

`yarn dep-graph` draws how the libraries depend on each other. Everything else you can run is in
the `scripts` of [`package.json`](package.json).

## Working on the code

The conventions of the repository are written once, in [`CLAUDE.md`](CLAUDE.md) and
[`.claude/rules/`](.claude/rules/). They are worded for coding agents, but they are the team's
rules: the checks to run before calling something done, the layering of the code, how tests are
written, what goes where. Read `CLAUDE.md` first, it is short; the rules of a folder matter when you
work in it.

- Tests, unit to end to end: [`docs/testing-guide.md`](docs/testing-guide.md)
- Issues, pull requests and commit messages: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Running PLaTon in production: [`docs/deployment.md`](docs/deployment.md)

## Implementing a ticket with a coding agent

The redesign moves forward one backlog ticket at a time, and the repository is set up so that a
coding agent ([Claude Code](https://claude.com/claude-code)) can carry a ticket from its tests to
its pull request while you keep the decisions. A typical session:

1. **Pick the ticket.** The roadmap gives the status of each one. A ticket ready to implement has
   its open points settled (its section 6); if they are not, settle them first, or ask the agent to
   propose answers and write the ones you accept into `DECISIONS.md`.
2. **Start the agent at the root of the repository** on a branch of its own, and name the ticket
   file: _« Implement `docs/backlog/<ticket>.md` »_. Naming the file matters: reading
   it loads the delivery rule ([`.claude/rules/transverse/delivery.md`](.claude/rules/transverse/delivery.md)),
   which tells the agent how a ticket is delivered here.
3. **Let it work, layer by layer.** It writes the tests first, then the contracts, the API, the
   design system and the screen, running each layer's checks before the next. It asks when the
   ticket leaves a choice open; answer, or point it at the part of the ticket that answers.
4. **You keep the machine.** The agent does not start or stop containers and dev servers: start
   them when it needs the running app. It writes integration and end to end specs but hands them
   to you, or to the CI of the pull request, since they start containers of their own.
5. **Look at the result.** It checks the screen in a browser on your running app, phone width and
   dark theme included, and reports in French what shipped, what it checked and what it could not.
   Look at the screenshots, try the screen yourself.
6. **Ask for a review.** _« Review the change »_: three reviewers read it in parallel (front, back,
   consistency); the agent checks each finding against the code, fixes the real ones and tells you
   which it rejected and why.
7. **Close.** The agent moves the ticket to `done/` with what changed on the way, updates the
   roadmap and logs the bugs it met. It commits only when you ask, in commits by layer, and opens a
   short pull request.

One ticket, one branch from `main`. If you stack branches, rebase each one on the one below and
never merge it in: GitHub rebases a stacked pull request when it merges it.

## License

[CeCILL-B](LICENSE)
