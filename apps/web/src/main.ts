import {
  UI_MODE_PARAM,
  UiFlag,
  browserStorage,
  loadUiFlag,
  parseUiMode,
  readStoredUiMode,
  resolveUiMode,
  withoutUiParam,
  writeStoredUiMode,
} from './ui-mode'
import { buildVersion, loadStylesheet, stylesheetHref } from './ui-styles'

const start = async (): Promise<void> => {
  const url = new URL(window.location.href)
  const storage = browserStorage()

  const param = parseUiMode(url.searchParams.get(UI_MODE_PARAM))
  if (param) {
    writeStoredUiMode(storage, param)
    window.history.replaceState(window.history.state, '', withoutUiParam(url))
  }

  const stored = readStoredUiMode(storage)
  // The flag only decides for people who have not chosen: skip the request otherwise.
  const flag: UiFlag = param || stored ? 'off' : await loadUiFlag()
  const mode = resolveUiMode({ param, stored, flag })

  // The interface code and its global styles download in parallel; Angular starts once both are in.
  const scripts = [...document.scripts].map((script) => script.src)
  const [{ bootstrap }] = await Promise.all([
    mode === 'next' ? import('./next/next.bootstrap') : import('./app/legacy.bootstrap'),
    loadStylesheet(document, stylesheetHref(`styles.${mode}.css`, buildVersion(scripts))),
  ])
  await bootstrap()
}

start().catch((error) => console.error(error))
