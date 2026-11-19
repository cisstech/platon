# Contributing

Thank you for helping PLaTon. Questions, bug reports and pull requests are all welcome.

## Ask, report, propose

Open an [issue](https://github.com/cisstech/platon/issues) for any of them, after a quick search
for an existing one.

- **A bug**: say what you did, what you expected and what happened, with the browser and the role
  you were signed in with. A bug we can reproduce is a bug we can fix.
- **A feature**: describe the need before the solution. For anything larger than a small change,
  wait for the discussion in the issue before writing code, so that your work fits where the project
  is going. The redesign has its own plan: [`docs/backlog/ROADMAP.md`](docs/backlog/ROADMAP.md).

## Send a pull request

1. Branch from `main`, one branch per change. If you stack branches, rebase each one on the one below
   instead of merging it in.
2. Follow the conventions of [`CLAUDE.md`](CLAUDE.md) and of the rules of
   [`.claude/rules/`](.claude/rules/) that apply to the folders you touch, tests included.
3. Run the checks `CLAUDE.md` lists before opening the pull request; its CI runs the same ones on the
   projects your change touches.
4. Open the pull request against `main` with a few factual sentences: what changes and why. Link the
   issue or the backlog ticket.

## Commit messages

```plaintext
<type>(<scope>): <subject>

<body>
```

- **type**: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` or `style`.
- **scope**: the library or the area changed (`web`, `design-system`, `course`, `result`, `backlog`).
- **subject**: in English, imperative, lower case, no final dot: `fix(course): …`.
- **body**, when useful: the why of the change, wrapped at 100 characters.

A breaking change says so in the footer, starting with `BREAKING CHANGE:`.

## License

By contributing, you agree that your contributions are released under the
[CeCILL-B](LICENSE) license of the project.
