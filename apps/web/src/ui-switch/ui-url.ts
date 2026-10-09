import { UiParam } from './ui-mode'

export const UI_PARAM = 'ui'

/*
 * Both helpers return the address relative to the origin and are built from the full URL: a relative
 * `?ui=` link would resolve against `<base href="/">` and lose the path.
 */

export const withUiParam = (url: URL, value: UiParam): string => {
  const target = new URL(url.href)
  target.searchParams.set(UI_PARAM, value)
  return relative(target)
}

export const withoutUiParam = (url: URL): string => {
  const target = new URL(url.href)
  target.searchParams.delete(UI_PARAM)
  return relative(target)
}

const relative = (url: URL): string => `${url.pathname}${url.search}${url.hash}`
