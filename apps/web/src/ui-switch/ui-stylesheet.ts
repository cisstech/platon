import { UiMode } from './ui-mode'

const STYLESHEET_TIMEOUT_MS = 10_000

/**
 * Href of the global stylesheet of an interface. The bundles are not injected in `index.html`, so their
 * names carry no hash: the build version of the entry script is added to never reuse an old sheet.
 */
export const uiStylesheetHref = (mode: UiMode, scriptSources: readonly string[]): string => {
  const bundle = `styles.${mode}.css`
  const version = buildVersion(scriptSources)
  return version ? `${bundle}?v=${encodeURIComponent(version)}` : bundle
}

/** Appends the sheet to `<head>` and resolves once applied, or on failure so the app still starts. */
export const loadStylesheet = (doc: Document, href: string, timeoutMs = STYLESHEET_TIMEOUT_MS): Promise<void> =>
  new Promise((resolve) => {
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

/** Hash of `main.<hash>.js` (webpack) or `main-<HASH>.js` (esbuild); empty in development. */
const buildVersion = (scriptSources: readonly string[]): string => {
  for (const src of scriptSources) {
    const match = /\/main[.-]([a-z0-9]+)\.js$/i.exec(src)
    if (match) return match[1]
  }
  return ''
}
