import { buildVersion, loadStylesheet, stylesheetHref } from './ui-styles'

describe('buildVersion', () => {
  it('reads the hash of the webpack entry script', () => {
    expect(buildVersion(['https://platon.test/runtime.d52.js', 'https://platon.test/main.f8afcda5ef80c6fb.js'])).toBe(
      'f8afcda5ef80c6fb'
    )
  })

  it('reads the hash of an esbuild entry script', () => {
    expect(buildVersion(['https://platon.test/main-7KQ2XMBD.js'])).toBe('7KQ2XMBD')
  })

  it('is empty in development, where scripts are not hashed', () => {
    expect(buildVersion(['http://localhost:4200/main.js', 'http://localhost:4200/vendor.js'])).toBe('')
  })

  it('ignores scripts that only contain main in a longer name', () => {
    expect(buildVersion(['https://platon.test/assets/domain.abc123.js'])).toBe('')
  })
})

describe('stylesheetHref', () => {
  it('adds the build version so a deploy never reuses an old sheet', () => {
    expect(stylesheetHref('styles.legacy.css', 'f8afcda5')).toBe('styles.legacy.css?v=f8afcda5')
  })

  it('keeps the plain name without a version', () => {
    expect(stylesheetHref('styles.next.css', '')).toBe('styles.next.css')
  })
})

describe('loadStylesheet', () => {
  afterEach(() => document.head.querySelectorAll('link').forEach((link) => link.remove()))

  const lastLink = () => document.head.querySelector<HTMLLinkElement>('link:last-of-type')

  it('appends the sheet to the head and waits for it', async () => {
    let done = false
    const loading = loadStylesheet(document, 'styles.legacy.css?v=1').then(() => (done = true))

    const link = lastLink()
    expect(link?.rel).toBe('stylesheet')
    expect(link?.getAttribute('href')).toBe('styles.legacy.css?v=1')

    await Promise.resolve()
    expect(done).toBe(false)

    link?.dispatchEvent(new Event('load'))
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
