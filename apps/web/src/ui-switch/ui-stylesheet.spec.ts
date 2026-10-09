import { loadStylesheet, uiStylesheetHref } from './ui-stylesheet'

describe('uiStylesheetHref', () => {
  it('versions the sheet with the hash of the webpack entry script', () => {
    const scripts = ['https://platon.test/runtime.d52.js', 'https://platon.test/main.f8afcda5ef80c6fb.js']
    expect(uiStylesheetHref('legacy', scripts)).toBe('styles.legacy.css?v=f8afcda5ef80c6fb')
  })

  it('versions the sheet with the hash of an esbuild entry script', () => {
    expect(uiStylesheetHref('next', ['https://platon.test/main-7KQ2XMBD.js'])).toBe('styles.next.css?v=7KQ2XMBD')
  })

  it('keeps the plain name in development, where scripts are not hashed', () => {
    expect(uiStylesheetHref('next', ['http://localhost:4200/main.js'])).toBe('styles.next.css')
  })

  it('ignores a script that only ends like the entry', () => {
    expect(uiStylesheetHref('legacy', ['https://platon.test/assets/domain.abc123.js'])).toBe('styles.legacy.css')
  })
})

describe('loadStylesheet', () => {
  afterEach(() => document.head.querySelectorAll('link').forEach((link) => link.remove()))

  const lastLink = () => document.head.querySelector<HTMLLinkElement>('link:last-of-type')

  it('appends the sheet to the head and waits for it', async () => {
    let done = false
    const loading = loadStylesheet(document, 'styles.legacy.css?v=1').then(() => (done = true))

    expect(lastLink()?.rel).toBe('stylesheet')
    expect(lastLink()?.getAttribute('href')).toBe('styles.legacy.css?v=1')
    await Promise.resolve()
    expect(done).toBe(false)

    lastLink()?.dispatchEvent(new Event('load'))
    await loading
    expect(done).toBe(true)
  })

  it('does not block the start when the sheet fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const loading = loadStylesheet(document, 'styles.next.css')
    lastLink()?.dispatchEvent(new Event('error'))
    await expect(loading).resolves.toBeUndefined()
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('does not block the start when the sheet never answers', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    await expect(loadStylesheet(document, 'styles.next.css', 10)).resolves.toBeUndefined()
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
