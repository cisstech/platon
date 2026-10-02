import { Component } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { TOOLTIP_DELAY, Tooltip } from './tooltip'

@Component({
  imports: [Button, Icon, Tooltip],
  template: `
    <button plButton variant="icon" plTooltip="Modifier le nom"><pl-icon name="edit" /></button>
    <button plButton variant="icon" aria-label="Fermer la navigation" plTooltip="Fermer">
      <pl-icon name="close" />
    </button>
  `,
})
class Host {}

/** jsdom has no `PointerEvent`: a mouse event with the pointer type the directive reads. */
const pointer = (type: string, pointerType = 'mouse') =>
  Object.defineProperty(new MouseEvent(type), 'pointerType', { value: pointerType })

describe('Tooltip', () => {
  let fixture: ComponentFixture<Host>
  const buttons = () => [...fixture.nativeElement.querySelectorAll('button')] as HTMLButtonElement[]
  const bubble = () => document.querySelector('pl-tooltip-bubble')

  beforeEach(() => {
    fixture = TestBed.createComponent(Host)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
  })

  afterEach(() => {
    fixture.destroy()
    document.querySelector('.cdk-overlay-container')?.remove()
  })

  it("names an element that has no name, and keeps the element's own name", () => {
    expect(buttons()[0].getAttribute('aria-label')).toBe('Modifier le nom')
    expect(buttons()[1].getAttribute('aria-label')).toBe('Fermer la navigation')
  })

  it('shows after the hover delay, and hides when the pointer leaves', fakeAsync(() => {
    buttons()[0].dispatchEvent(pointer('pointerenter'))
    tick(TOOLTIP_DELAY - 1)
    expect(bubble()).toBeNull()
    tick(1)
    fixture.detectChanges()
    expect(bubble()?.textContent).toBe('Modifier le nom')
    expect(bubble()?.getAttribute('aria-hidden')).toBe('true')
    buttons()[0].dispatchEvent(pointer('pointerleave'))
    expect(bubble()).toBeNull()
  }))

  it('never shows on touch', fakeAsync(() => {
    buttons()[0].dispatchEvent(pointer('pointerenter', 'touch'))
    tick(TOOLTIP_DELAY)
    expect(bubble()).toBeNull()
  }))

  it('hides on Escape', fakeAsync(() => {
    buttons()[0].dispatchEvent(pointer('pointerenter'))
    tick(TOOLTIP_DELAY)
    fixture.detectChanges()
    expect(bubble()).not.toBeNull()
    buttons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(bubble()).toBeNull()
  }))
})
