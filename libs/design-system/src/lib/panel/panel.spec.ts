import { Component, signal, viewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Panel, PanelLayout } from './panel'

@Component({
  imports: [Panel],
  template: `
    <pl-panel
      heading="Notifications"
      headingId="panel-title"
      closeLabel="Fermer les notifications"
      [layout]="layout()"
      (closed)="closed = closed + 1"
    >
      <button type="button" plPanelActions>Tout marquer comme lu</button>
      <span plPanelTools>3 non lues</span>
      <p>Contenu</p>
    </pl-panel>
  `,
})
class Host {
  readonly panel = viewChild.required(Panel)
  readonly layout = signal<PanelLayout>('popover')
  closed = 0
}

describe('Panel', () => {
  const render = (layout: PanelLayout) => {
    const fixture = TestBed.createComponent(Host)
    fixture.componentInstance.layout.set(layout)
    fixture.detectChanges()
    return { fixture, panel: fixture.nativeElement.querySelector('pl-panel') as HTMLElement }
  }

  it('is titled for the dialog that opens it, with its actions in the head', () => {
    const { panel } = render('popover')

    expect(panel.querySelector('h2')?.id).toBe('panel-title')
    expect(panel.querySelector('.pl-panel__head')?.textContent).toContain('Tout marquer comme lu')
    expect(panel.querySelector('.pl-panel__body')?.textContent).toContain('Contenu')
  })

  it.each([
    ['popover', 'close'],
    ['screen', 'arrow_back'],
  ] as const)('closes from its %s head by a button named for it', (layout, icon) => {
    const { fixture, panel } = render(layout)
    const close = panel.querySelector('button[aria-label="Fermer les notifications"]') as HTMLButtonElement

    expect(close.querySelector('use')?.getAttribute('href')).toContain(`#${icon}`)
    close.click()
    expect(fixture.componentInstance.closed).toBe(1)
    expect(panel.querySelectorAll('button[aria-label="Fermer les notifications"]')).toHaveLength(1)
  })

  it('hands the focus to its close button, when what held it has gone', () => {
    const { fixture, panel } = render('popover')
    document.body.appendChild(fixture.nativeElement)

    fixture.componentInstance.panel().focusClose()

    expect(document.activeElement).toBe(panel.querySelector('button[aria-label="Fermer les notifications"]'))
    fixture.nativeElement.remove()
  })
})
