import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Segmented, SegmentedOption } from './segmented'

type Theme = 'light' | 'dark' | 'system'

@Component({
  imports: [Segmented],
  template: `<pl-segmented label="Thème" [options]="options" [(value)]="theme" />`,
})
class Host {
  readonly options: SegmentedOption<Theme>[] = [
    { value: 'light', label: 'Clair' },
    { value: 'dark', label: 'Sombre' },
    { value: 'system', label: 'Auto', icon: 'contrast', iconOnly: true },
  ]
  readonly theme = signal<Theme>('light')
}

describe('Segmented', () => {
  let fixture: ComponentFixture<Host>
  const group = () => fixture.nativeElement.querySelector('pl-segmented') as HTMLElement
  const radios = () => [...group().querySelectorAll('input')] as HTMLInputElement[]

  beforeEach(() => {
    fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
  })

  it('is a named group of radio buttons sharing one name', () => {
    expect(group().getAttribute('role')).toBe('radiogroup')
    expect(group().getAttribute('aria-label')).toBe('Thème')
    expect(new Set(radios().map((radio) => radio.name)).size).toBe(1)
    expect(radios().map((radio) => radio.checked)).toEqual([true, false, false])
  })

  it('sets the value when an option is chosen', () => {
    radios()[1].click()
    fixture.detectChanges()
    expect(fixture.componentInstance.theme()).toBe('dark')
    expect(radios().map((radio) => radio.checked)).toEqual([false, true, false])
  })

  it('focuses the chosen option', () => {
    fixture.componentInstance.theme.set('dark')
    fixture.detectChanges()

    fixture.debugElement.query((node) => node.name === 'pl-segmented').componentInstance.focus()

    expect(document.activeElement).toBe(radios()[1])
  })

  it('keeps the label of an icon-only option as its accessible name', () => {
    const auto = radios()[2].closest('label') as HTMLLabelElement
    expect(auto.textContent?.trim()).toBe('Auto')
    expect(auto.querySelector('pl-icon')).not.toBeNull()
  })

  it('says how many each choice holds, read after its label', () => {
    TestBed.resetTestingModule()
    @Component({
      imports: [Segmented],
      template: `<pl-segmented label="Cours affichés" [options]="options" value="current" />`,
    })
    class Counted {
      readonly options: SegmentedOption[] = [
        { value: 'current', label: 'Actuels', count: 3 },
        { value: 'archived', label: 'Archivés', count: 0 },
      ]
    }
    const counted = TestBed.createComponent(Counted)
    counted.detectChanges()

    const labels = [...counted.nativeElement.querySelectorAll('label')] as HTMLElement[]
    expect(labels.map((label) => label.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['Actuels, 3', 'Archivés, 0'])
    expect(labels[0].querySelector('pl-count')?.textContent?.trim()).toBe('3')
  })
})
