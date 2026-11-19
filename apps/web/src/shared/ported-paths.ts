/**
 * The addresses the new interface serves; every other one opens in the current interface through
 * the bridge, as does the step of an external application on the sign-in page (`callbackUrl`). A
 * segment `:param` stands for any one segment. Kept in step with its routes by `next.routes.spec.ts`.
 */
export const PORTED_PATHS: readonly string[] = [
  '/',
  '/announcements',
  '/courses',
  '/courses/:id',
  '/courses/:id/dashboard',
  '/courses/create',
  '/dashboard',
  '/login',
]

const segmentsOf = (path: string) => path.split('/').filter(Boolean)

/** Whether `path` is the address `pattern`, a segment `:param` standing for any one segment. */
const matches = (pattern: string, path: string): boolean => {
  const expected = segmentsOf(pattern)
  const actual = segmentsOf(path)
  return (
    expected.length === actual.length &&
    expected.every((segment, index) => segment.startsWith(':') || segment === actual[index])
  )
}

/** Whether the new interface serves `url`, whatever its query and fragment. */
export const isPorted = (url: string): boolean => {
  const [path] = url.split(/[?#]/)
  return PORTED_PATHS.some((pattern) => matches(pattern, path))
}
