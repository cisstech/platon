import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Dialog } from './dialog'

describe('Dialog', () => {
  let fixture: ComponentFixture<Dialog>
  let host: HTMLElement

  const buttons = () => [...host.querySelectorAll('button')]

  beforeEach(() => {
    fixture = TestBed.createComponent(Dialog)
    fixture.componentRef.setInput('heading', 'Supprimer le cours ?')
    fixture.componentRef.setInput('confirmLabel', 'Supprimer')
    fixture.componentRef.setInput('cancelLabel', 'Annuler')
    host = fixture.nativeElement
    fixture.detectChanges()
  })

  it('titles itself with an id to label the dialog', () => {
    const title = host.querySelector('h2')
    expect(title?.textContent).toBe('Supprimer le cours ?')
    expect(title?.id).toMatch(/^pl-dialog-title-\d+$/)
  })

  it('puts the cancel action first, then the confirmation', () => {
    expect(buttons().map((button) => button.textContent?.trim())).toEqual(['Annuler', 'Supprimer'])
  })

  it('emits the chosen action', () => {
    const confirmed = jest.fn()
    const cancelled = jest.fn()
    fixture.componentInstance.confirmed.subscribe(confirmed)
    fixture.componentInstance.cancelled.subscribe(cancelled)
    buttons()[0].click()
    buttons()[1].click()
    expect(cancelled).toHaveBeenCalledTimes(1)
    expect(confirmed).toHaveBeenCalledTimes(1)
  })

  it('marks a destructive confirmation and can disable it', () => {
    fixture.componentRef.setInput('tone', 'danger')
    fixture.componentRef.setInput('confirmDisabled', true)
    fixture.detectChanges()
    expect(host.dataset['tone']).toBe('danger')
    expect(buttons()[1].disabled).toBe(true)
  })
})
