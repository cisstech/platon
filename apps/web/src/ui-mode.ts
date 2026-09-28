/**
 * Which interface starts: the current one (`legacy`) or the new one (`next`).
 *
 * Read before Angular boots, so this file has no Angular dependency. Order of precedence
 * (backlog decision D4): the `?ui=` query parameter, then the preference stored in
 * `localStorage`, then the `next` flag of `assets/ui.json` (D14).
 */
export type UiMode = 'legacy' | 'next'

/**
 * `off`: the new interface is only reachable with `?ui=next`.
 * `opt-in`: it is offered to people who have not chosen yet.
 * `default`: it starts for people who have not chosen yet.
 */
export type UiFlag = 'off' | 'opt-in' | 'default'

export const UI_MODE_PARAM = 'ui'
export const UI_MODE_STORAGE_KEY = 'platon.ui'
export const UI_FLAG_URL = 'assets/ui.json'

const UI_FLAG_TIMEOUT_MS = 2000

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'setItem'>
type FetchFn = (input: string, init?: RequestInit) => Promise<Response>

export const parseUiMode = (value: unknown): UiMode | null => (value === 'legacy' || value === 'next' ? value : null)

export const parseUiFlag = (value: unknown): UiFlag => (value === 'opt-in' || value === 'default' ? value : 'off')

export const resolveUiMode = (input: { param: UiMode | null; stored: UiMode | null; flag: UiFlag }): UiMode =>
  input.param ?? input.stored ?? (input.flag === 'default' ? 'next' : 'legacy')

/** `window.localStorage`, or `null` where reading it throws (some private browsing modes). */
export const browserStorage = (): Storage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readStoredUiMode = (storage: ReadableStorage | null): UiMode | null => {
  try {
    return parseUiMode(storage?.getItem(UI_MODE_STORAGE_KEY))
  } catch {
    return null
  }
}

export const writeStoredUiMode = (storage: WritableStorage | null, mode: UiMode): void => {
  try {
    storage?.setItem(UI_MODE_STORAGE_KEY, mode)
  } catch {
    // Without storage the choice lasts for this page load only.
  }
}

/** The same address without the `ui` parameter, relative to the origin. */
export const withoutUiParam = (url: URL): string => {
  const clean = new URL(url.href)
  clean.searchParams.delete(UI_MODE_PARAM)
  return `${clean.pathname}${clean.search}${clean.hash}`
}

/** The `next` flag of `assets/ui.json`; `off` when the file is missing, invalid or slow. */
export const loadUiFlag = async (fetchFn: FetchFn = fetch, timeoutMs = UI_FLAG_TIMEOUT_MS): Promise<UiFlag> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchFn(UI_FLAG_URL, { cache: 'no-store', signal: controller.signal })
    if (!response.ok) return 'off'
    const body = (await response.json()) as { next?: unknown } | null
    return parseUiFlag(body?.next)
  } catch {
    return 'off'
  } finally {
    clearTimeout(timer)
  }
}
