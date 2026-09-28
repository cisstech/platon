import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { UI_MODE_PARAM } from '../../ui-mode'

/** Shown for every address until the screens are ported and the bridge (S-04) takes over. */
@Component({
  selector: 'app-next-placeholder',
  template: `
    <main class="placeholder">
      <h1>Nouvelle interface</h1>
      <p>La nouvelle interface de PLaTon est en construction. Cette page n'y existe pas encore.</p>
      <a [href]="legacyHref">Ouvrir cette page dans l'interface actuelle</a>
    </main>
  `,
  styles: `
    .placeholder {
      max-width: 560px;
      margin: 20vh auto 0;
      padding: 0 16px;
      font-family: system-ui, sans-serif;
      line-height: 1.5;
    }
    h1 {
      font-size: 28px;
      margin: 0 0 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextPlaceholderPage {
  /** Same address, current interface. Built from the full URL: a relative `?ui=` would resolve against `<base href="/">`. */
  protected readonly legacyHref = (() => {
    const url = new URL(inject(DOCUMENT).location.href)
    url.searchParams.set(UI_MODE_PARAM, 'legacy')
    return `${url.pathname}${url.search}${url.hash}`
  })()
}
