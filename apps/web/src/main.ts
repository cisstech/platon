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

  const { bootstrap } = mode === 'next' ? await import('./next/next.bootstrap') : await import('./app/legacy.bootstrap')
  await bootstrap()
}

start().catch((error) => console.error(error))
