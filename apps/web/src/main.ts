import { showBootError } from './ui-switch/boot-screen'
import { readUiFlag } from './ui-switch/ui-flag'
import { parseUiMode, parseUiParam, resolveUiMode } from './ui-switch/ui-mode'
import { readUiPreference, writeUiPreference } from './ui-switch/ui-storage'
import { loadStylesheet, uiStylesheetHref } from './ui-switch/ui-stylesheet'
import { UI_PARAM, withoutUiParam } from './ui-switch/ui-url'

/** Chooses the interface before Angular boots, then loads only that one: its code and its global styles. */
const start = async (): Promise<void> => {
  const url = new URL(window.location.href)
  const param = parseUiParam(url.searchParams.get(UI_PARAM))
  if (param) {
    // A mode becomes the preference; the bridge pass never does.
    const chosen = parseUiMode(param)
    if (chosen) writeUiPreference(chosen)
    window.history.replaceState(window.history.state, '', withoutUiParam(url))
  }

  const stored = readUiPreference()
  const flag = readUiFlag(document)
  const mode = resolveUiMode({ param, stored, flag })

  const scripts = [...document.scripts].map((script) => script.src)
  const [{ bootstrap }] = await Promise.all([
    mode === 'next' ? import('./next/next.bootstrap') : import('./app/legacy.bootstrap'),
    loadStylesheet(document, uiStylesheetHref(mode, scripts)),
  ])
  await bootstrap({ flag, stored, bridged: param === 'legacy-once' })
}

start().catch((error) => {
  console.error(error)
  showBootError(document)
})
