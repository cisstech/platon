import { showBootError } from './boot-screen'

describe('showBootError', () => {
  afterEach(() => (document.body.innerHTML = ''))

  it('turns the loading screen into a message with a way to retry', () => {
    document.body.innerHTML = `
      <app-root><div id="boot-screen" role="status"><p class="boot-message">Chargement de PLaTon</p></div></app-root>`
    showBootError(document)

    const screen = document.getElementById('boot-screen')
    expect(screen?.classList).toContain('is-error')
    expect(screen?.getAttribute('role')).toBe('alert')
    expect(screen?.textContent).toContain("PLaTon n'a pas pu démarrer.")
    expect(screen?.querySelector('button')?.textContent).toBe('Recharger')
  })

  it('still shows the message when the loading screen is already gone', () => {
    document.body.innerHTML = '<app-root></app-root>'
    showBootError(document)
    expect(document.getElementById('boot-screen')?.textContent).toContain("PLaTon n'a pas pu démarrer.")
  })

  it('shows the message once, even if called twice', () => {
    document.body.innerHTML = '<app-root></app-root>'
    showBootError(document)
    showBootError(document)
    expect(document.querySelectorAll('#boot-screen button')).toHaveLength(1)
  })
})
