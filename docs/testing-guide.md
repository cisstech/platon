# Testing the API libraries

A library of the API (`libs/**/server`) has three kinds of tests, told apart by their file name:

| Kind        | File                    | What it proves                                                    | Nx target          |
| ----------- | ----------------------- | ----------------------------------------------------------------- | ------------------ |
| Unit        | `*.spec.ts`             | The logic of one class, its collaborators mocked                  | `test`             |
| Integration | `*.integration.spec.ts` | A query or a service against a real PostgreSQL, without NestJS    | `test:integration` |
| End to end  | `*.e2e.spec.ts`         | A route through the whole HTTP pipeline: validation, auth, guards | `test:e2e`         |

`test:all` runs the three in a row. Integration and end to end tests start a PostgreSQL container of
their own through [testcontainers](https://testcontainers.com/), so Docker must be running; they
need no database of yours.

The rules for writing tests that hold (what to assert, what to mock, naming) are in
[`.claude/rules/transverse/testing.md`](../.claude/rules/transverse/testing.md).

## Set up a library

Copy the test configuration of the reference library,
[`libs/feature/announcement/server`](../libs/feature/announcement/server), and rename it: its three
Jest configurations, the matching `tsconfig.*.json` files and the targets of its `project.json`.
Each Jest configuration selects its files by their suffix, so keep the names as they are.

The integration and end to end configurations turn on `emitDecoratorMetadata` and
`experimentalDecorators`: TypeORM maps the entities and NestJS injects the services through
decorators, which unit tests mock away but these tests run for real.

## Helpers

| Import                            | Helper                                     | For                                                                               |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| `@platon/core/testing/server`     | `mockRepository`, `mockSelectQueryBuilder` | Unit tests: a TypeORM repository or query builder whose methods are mocks         |
| `@platon/core/testing/server`     | `createUserEntity`                         | Any test: a user with default values                                              |
| `@platon/core/testing/server`     | `createTestDatabase(entities)`             | Integration tests: a real database with the given entities, and its teardown      |
| `@platon/core/testing/e2e-server` | `createE2EApp(options)`                    | End to end tests: a NestJS app with its database, auth and guards, and test users |

Examples to start from:

- Integration:
  [`activity-order.integration.spec.ts`](../libs/feature/course/server/src/lib/activity/activity-order.integration.spec.ts),
  which builds a service on a real repository.
- End to end:
  [`course.controller.e2e.spec.ts`](../libs/feature/course/server/src/lib/course.controller.e2e.spec.ts),
  which checks who may read and write a course.

## Run them

```sh
nx run <project>:test               # unit
nx run <project>:test:integration   # integration
nx run <project>:test:e2e           # end to end
nx run <project>:test:all           # the three

yarn affected:test:integration --base=origin/main   # every project the branch touches
yarn affected:test:e2e --base=origin/main
```

A pull request to `main` runs the three kinds on the projects it touches.
