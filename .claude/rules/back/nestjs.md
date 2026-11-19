---
paths:
  - 'apps/api/**'
  - 'libs/**/server/**'
---

# API and server libraries

The API is not hexagonal and does not become so piece by piece: one architecture, the feature
library. Each `libs/feature/<domain>/server` holds one Nest module at its root and one folder per
sub-domain, with files named `<name>.<kind>.ts` (`entity`, `view`, `dto`, `service`, `controller`,
`event`, `listeners`, `subscriber`, and `sql` for the SQL fragments several queries share) and their
specs beside them. Several shapes coexist in the existing
code; new and touched code follows the one below.

## Layers

- Controller: route, `@Roles(...)`, `@UUIDParam`, `@Req() req: IRequest`, the access check, the
  mapping (`Mapper.map` / `Mapper.mapAll` to a DTO) and the wrapper (`ItemResponse`, `ListResponse`).
  No business rule, no event, no query of its own.
- Service: business rules, queries, events (`EventService.emit` with constants and payloads from
  `*.event.ts`; handlers in `*.listeners.ts`). A lookup returns an `Optional` the caller ends with
  `.orElseThrow(() => new NotFoundResponse(...))`.
- DTO: `class-validator` checks the shape only, `implements` the interface from the `common` library
  and extends `BaseDTO`. A business rule lives in the service, never in a decorator.
- A relation selected in part still comes back as an entity, with its field initializers
  (`UserEntity.hasPassword = false`), and `Mapper` keeps every key: the DTO picks what it sends.
- `toBoolean` reads `null` and `''` as true: an optional boolean field maps `null` to `undefined`
  before it, and the browser leaves an unset filter `undefined` (`buildHttpParams` sends `null` as
  `''`).
- Errors are the `*Response` classes of `@platon/core/common` (`NotFoundResponse`,
  `ForbiddenResponse`, `BadRequestResponse`), never Nest's built-in exceptions. Messages in English.

## Access

- Every route is authenticated by the global guards unless it says `@Public()`; roles come from
  `@Roles`. Access to one resource goes through the permissions service of its domain (courses,
  resources), never an inline role test.
- A row that belongs to a person is read, changed and deleted with its owner in the `WHERE`
  (`{ userId, id: In(ids) }`). An identifier received from a client proves nothing.
- A body never goes onto an entity whole (`Object.assign`, spread into `create`): pick the fields a
  client may change. The global `ValidationPipe` has no `whitelist`, so a `courseId` sent along
  survives and moves the row.
- A key unique only within its parent (a group's `groupId` within its course) is looked up with its
  parent, through the permissions service.

## API shape

- REST is the API (prefix `/api`, version `v1`, Swagger at `/api/doc`), and nothing else: no
  GraphQL, no WebSocket. Realtime is a server-sent event stream: an `@Sse` route returns
  `eventStream(req, events)` (`libs/core/server`, heartbeat and end at the token expiry), its events
  cross the API instances through `PubSubService` (Redis), and the browser reads it with
  `EventStreamClient` (`@platon/core/browser/shared`).
- A field added to a shared response is additive: the current interface keeps reading the old ones.
