import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SHEET_DISMISS_DISTANCE, Sheet, SheetField, SheetItem } from './sheet'

@Component({
  imports: [Sheet, SheetField, SheetItem],
  template: `
    <pl-sheet (dismissed)="dismissed = dismissed + 1">
      <a plSheetItem href="/account" icon="account_circle" trailing="chevron_right">Mon compte</a>
      <pl-sheet-field label="Thème" icon="light_mode"><span class="control">x</span></pl-sheet-field>
      <button plSheetItem type="button" icon="logout">Se déconnecter</button>
    </pl-sheet>
  `,
})
class Host {
  dismissed = 0
}

describe('Sheet', () => {
  let fixture: ComponentFixture<Host>
  const sheet = () => fixture.nativeElement.querySelector('pl-sheet') as HTMLElement
  const handle = () => sheet().querySelector('.pl-sheet__handle') as HTMLElement
  const pointer = (type: string, clientY: number) =>
    handle().dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, clientY }), { pointerId: 1 }))

  beforeEach(() => {
    fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
  })

  it('follows the finger down its handle, and closes past the distance', () => {
    pointer('pointerdown', 100)
    pointer('pointermove', 140)
    fixture.detectChanges()
    expect(sheet().style.transform).toBe('translateY(40px)')
    pointer('pointermove', 100 + SHEET_DISMISS_DISTANCE)
    pointer('pointerup', 100 + SHEET_DISMISS_DISTANCE)
    fixture.detectChanges()
    expect(fixture.componentInstance.dismissed).toBe(1)
    expect(sheet().style.transform).toBe('')
  })

  it('comes back when released too early, and never moves up', () => {
    pointer('pointerdown', 100)
    pointer('pointermove', 60)
    fixture.detectChanges()
    expect(sheet().style.transform).toBe('')
    pointer('pointermove', 130)
    pointer('pointerup', 130)
    fixture.detectChanges()
    expect(fixture.componentInstance.dismissed).toBe(0)
    expect(sheet().style.transform).toBe('')
  })

  it('keeps its handle out of reach of screen readers, and lays out its entries', () => {
    expect(handle().getAttribute('aria-hidden')).toBe('true')
    const [account, signOut] = [...sheet().querySelectorAll<HTMLElement>('[plSheetItem]')]
    expect(account.textContent?.trim()).toBe('Mon compte')
    expect(signOut.textContent?.trim()).toBe('Se déconnecter')
    expect(sheet().querySelector('pl-sheet-field')?.textContent).toContain('Thème')
  })
})

describe('Sheet outside its handle', () => {
  it('lets a press on an entry stay a click, never a pull', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const entry = fixture.nativeElement.querySelector('[plSheetItem]') as HTMLElement
    const at = (type: string, clientY: number) =>
      entry.dispatchEvent(Object.assign(new MouseEvent(type, { bubbles: true, clientY }), { pointerId: 1 }))
    at('pointerdown', 100)
    at('pointermove', 100 + 2 * SHEET_DISMISS_DISTANCE)
    at('pointerup', 100 + 2 * SHEET_DISMISS_DISTANCE)
    fixture.detectChanges()
    expect(fixture.componentInstance.dismissed).toBe(0)
  })
})
