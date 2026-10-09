/**
 * The loading screen is static markup inside `<app-root>` in `index.html`, so it shows before any
 * script runs and Angular replaces it on its first render. It only needs code when the start fails.
 */
export const showBootError = (doc: Document): void => {
  const screen = doc.getElementById('boot-screen') ?? createScreen(doc)
  if (screen.classList.contains('is-error')) return

  screen.classList.add('is-error')
  screen.setAttribute('role', 'alert')
  screen.replaceChildren(
    paragraph(doc, "PLaTon n'a pas pu démarrer."),
    paragraph(doc, 'Vérifiez votre connexion, puis rechargez la page.'),
    reloadButton(doc)
  )
}

const createScreen = (doc: Document): HTMLElement => {
  const screen = doc.createElement('div')
  screen.id = 'boot-screen'
  screen.className = 'boot-screen'
  doc.body.appendChild(screen)
  return screen
}

const paragraph = (doc: Document, text: string): HTMLParagraphElement => {
  const element = doc.createElement('p')
  element.className = 'boot-message'
  element.textContent = text
  return element
}

const reloadButton = (doc: Document): HTMLButtonElement => {
  const button = doc.createElement('button')
  button.type = 'button'
  button.className = 'boot-reload'
  button.textContent = 'Recharger'
  button.addEventListener('click', () => doc.defaultView?.location.reload())
  return button
}
