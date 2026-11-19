---
paths:
  - 'libs/**/server/**'
  - 'migrations/**'
---

# Data and migrations

- Entities extend `BaseEntity` (`libs/core/server`) and live in `*.entity.ts`, the only name the
  migration generator scans; views in `*.view.ts`. Tables are PascalCase plurals
  (`@Entity('CourseMembers')`), columns snake*case through `name:`, indexes `<Table>*<column>\_idx`.
- The schema changes by a generated migration: edit the entity, then
  `./bin/migration/generate.sh <PascalName>` writes `migrations/<timestamp>-<PascalName>.ts`. Never
  hand-written DDL, never `synchronize`. Running and reverting it touches the person's database:
  hand them `./bin/migration/run.sh` and `revert.sh`.
- Raw SQL goes through `DataSource.query` or `repository.query` with `$n` parameters (named `:x` in
  the query builder), never a value written into the string.
- Two queries that must count the same thing share their predicate as one constant, so they cannot
  drift apart.
- A raw query or a view gets an integration spec on a real PostgreSQL (`*.integration.spec.ts`,
  `createTestDatabase` from `@platon/core/testing/server`). A unit spec with a mocked repository only
  proves the SQL string was sent.
- A query that runs on every page load stays cheap: aggregate per row first rather than a
  `COUNT(DISTINCT ...)` over a large join, which keeps PostgreSQL from hashing.
- Such a query starts from the person's own rows (`WHERE user_id = $1`): a test on the nullable side of
  a `LEFT JOIN` cannot use the index and reads the whole table.
- A large jsonb column (an activity's `source` embeds every exercise) is read once per row, its parts
  taken out in a `CROSS JOIN LATERAL (... OFFSET 0)`: each `->` on it decompresses it again.
