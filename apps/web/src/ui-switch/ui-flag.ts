import { UiFlag, parseUiFlag } from './ui-mode'

/**
 * The flag is a `<meta name="platon-ui-next">` of `index.html`: it can be changed in the deployed file
 * without a rebuild, and reading it costs no request. `off` when missing or unknown.
 */
export const readUiFlag = (doc: Document): UiFlag =>
  parseUiFlag(doc.querySelector<HTMLMetaElement>('meta[name="platon-ui-next"]')?.content)
