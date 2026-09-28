/**
 * Global stylesheet of the interface that starts (backlog decision D11).
 *
 * Each interface has its own non-injected bundle (`styles.legacy.css`, `styles.next.css`), loaded by
 * `main.ts` before Angular boots so nothing renders unstyled. Non-injected bundles are not hashed, so
 * the href carries the build version to never reuse a sheet from a previous deploy.
 */

const STYLESHEET_TIMEOUT_MS = 10_000

/** Hash of the entry script (`main.<hash>.js` with webpack, `main-<HASH>.js` with esbuild); empty when unhashed. */
export const buildVersion = (scriptSources: readonly string[]): string => {
  for (const src of scriptSources) {
    const match = /\/main[.-]([a-z0-9]+)\.js$/i.exec(src)
    if (match) return match[1]
  }
  return ''
}

export const stylesheetHref = (bundle: string, version: string): string =>
  version ? `${bundle}?v=${encodeURIComponent(version)}` : bundle

/** Appends the sheet to `<head>` and resolves once it is applied, or on failure so the app still starts. */
export const loadStylesheet = (doc: Document, href: string, timeoutMs = STYLESHEET_TIMEOUT_MS): Promise<void> =>
  new Promise((resolve) => {
    // `settle` only runs after `timer` exists: on timeout, or on an event of the link appended below.
    const settle = (failure?: string) => {
      clearTimeout(timer)
      if (failure) console.error(`Stylesheet ${href} ${failure}`)
      resolve()
    }
    const timer = setTimeout(() => settle(`timed out after ${timeoutMs} ms`), timeoutMs)

    const link = doc.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.addEventListener('load', () => settle(), { once: true })
    link.addEventListener('error', () => settle('failed to load'), { once: true })
    doc.head.appendChild(link)
  })
