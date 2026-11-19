/**
 * The addresses the new interface serves; every other one opens in the current interface through
 * the bridge. Kept in step with the shell routes by `next.routes.spec.ts`.
 */
export const PORTED_PATHS: readonly string[] = ['/', '/dashboard']

/** Whether the new interface serves `url`, whatever its query and fragment. */
export const isPorted = (url: string): boolean => {
  const [path] = url.split(/[?#]/)
  return PORTED_PATHS.includes(path.replace(/\/+$/, '') || '/')
}
