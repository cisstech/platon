import { UiMode, parseUiMode } from './ui-mode'

/*
 * Every access is guarded: where the storage is missing or throws (some private browsing modes), a
 * choice simply lasts for the current page load.
 */

type UiStorage = Pick<Storage, 'getItem' | 'setItem'>

const PREFERENCE_KEY = 'platon.ui'
const OFFER_DISMISSED_KEY = 'platon.ui.offer-dismissed'

export const browserStorage = (): UiStorage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const readUiPreference = (storage = browserStorage()): UiMode | null =>
  parseUiMode(read(storage, PREFERENCE_KEY))

export const writeUiPreference = (mode: UiMode, storage = browserStorage()): void =>
  write(storage, PREFERENCE_KEY, mode)

export const isUiOfferDismissed = (storage = browserStorage()): boolean => read(storage, OFFER_DISMISSED_KEY) === '1'

export const dismissUiOffer = (storage = browserStorage()): void => write(storage, OFFER_DISMISSED_KEY, '1')

const read = (storage: UiStorage | null, key: string): string | null => {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

const write = (storage: UiStorage | null, key: string, value: string): void => {
  try {
    storage?.setItem(key, value)
  } catch {
    // The choice lasts for this page load.
  }
}
