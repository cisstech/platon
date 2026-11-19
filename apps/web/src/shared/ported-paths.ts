/**
 * The addresses the new interface serves; every other one opens in the current interface through
 * the bridge, as does the step of an external application on the sign-in page (`callbackUrl`). Kept
 * in step with its routes by `next.routes.spec.ts`.
 */
export const PORTED_PATHS: readonly string[] = ['/', '/dashboard', '/login']

/** Whether the new interface serves `url`, whatever its query and fragment. */
export const isPorted = (url: string): boolean => {
  const [path] = url.split(/[?#]/)
  return PORTED_PATHS.includes(path.replace(/\/+$/, '') || '/')
}
