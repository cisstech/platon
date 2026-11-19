---
paths:
  - 'libs/**/common/**'
---

# Shared contracts (`libs/**/common`)

- `@platon/core/common` and `@platon/feature/<domain>/common` hold what the API and the browser share:
  the models (`*.model.ts`), the response wrappers and error classes, pure helpers. The server DTO
  `implements` the model; the browser reads the same model.
- A `common` library imports neither Angular, Nest nor TypeORM: both sides load it.
- One notion has one definition: never a copy, an alias or a narrowed duplicate on one side. A pure
  helper both sides need lives here, with its spec.
- A change is additive: a new field, never a renamed or retyped one, since both interfaces read these
  models until the current one is removed.
