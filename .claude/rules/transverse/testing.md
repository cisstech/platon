---
paths:
  - '**/*.spec.ts'
  - '**/*.stories.ts'
  - '**/*.test.mjs'
---

# Tests

- Jest everywhere; a spec sits next to what it tests. The new interface and the design system ship
  their specs with the change, and every library component also has its stories.
- Test names are in English, like the code. Older server specs are in French (`devrait ...`): a file
  keeps one language, and a spec written or rewritten is in English.
- Server units: `Test.createTestingModule` with `mockRepository` and `mockSelectQueryBuilder` from
  `@platon/core/testing/server`; collaborators typed `jest.Mocked<Pick<Service, 'method'>>`.
- SQL, views and access rules are proven on a real database (`*.integration.spec.ts`), an endpoint end
  to end with `createE2EApp` (`*.e2e.spec.ts`). Both start a container: CI runs them.
- An endpoint whose behaviour needs no database (authentication, validation) is tested over HTTP
  with its real module and mocked collaborators (`*.http.spec.ts`), in the unit target.
- Front: `TestBed` and `RouterTestingHarness`; the app runs with zone.js, so `fakeAsync` works, except
  over native `async`/`await`, which Jest does not downlevel: there, await real promises.
  Text a screen reader reads is asserted without the `aria-hidden` parts.

## Tests that hold

- Write the test red first: a test already green against the old code proves nothing.
- A test states a behaviour, never history (no "no longer does X").
- Assert a literal value or cross a real boundary (HTTP, database, DOM); comparing the code to its own
  constant restates the implementation.
- With supertest, build each request when you send it (`() => http().post(...)`): a request built
  ahead starts the shared server and closes it when it ends, so the next ones are refused.
- After a refused write, assert the rows did not change; a status alone passes when the check comes
  after the write.
