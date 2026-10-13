import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../../../../shared/testing/spoken'
import { AnnouncementSearch } from './announcement-search'

@Component({
  imports: [AnnouncementSearch],
  template: `<app-announcement-search
    [value]="value()"
    [noMatch]="noMatch()"
    (searched)="searched.push($event)"
    (cleared)="cleared = true"
  />`,
})
class Host {
  readonly value = signal('')
  readonly noMatch = signal<string | undefined>(undefined)
  readonly searched: string[] = []
  cleared = false
}

describe('AnnouncementSearch', () => {
  const render = () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)
    const element = fixture.nativeElement as HTMLElement
    return {
      fixture,
      host: fixture.componentInstance,
      input: element.querySelector('input') as HTMLInputElement,
      element,
    }
  }

  afterEach(() => (document.body.innerHTML = ''))

  it('is a search field labelled for screen readers, which says what is typed', () => {
    const { input, element, host } = render()

    expect(input.type).toBe('search')
    expect(spoken(element.querySelector(`label[for="${input.id}"]`))).toBe('Rechercher une annonce')
    input.value = 'examen'
    input.dispatchEvent(new Event('input'))
    expect(host.searched).toEqual(['examen'])
  })

  it('says what it found nothing for, and clears it, the focus back in the field', () => {
    const { fixture, host, input, element } = render()
    expect(element.querySelector('pl-empty')).toBeNull()

    host.noMatch.set('Aucune annonce ne correspond à « examen ».')
    fixture.detectChanges()
    expect(spoken(element.querySelector('pl-empty h2'))).toBe('Aucune annonce ne correspond à « examen ».')
    const clear = element.querySelector('pl-empty button') as HTMLButtonElement
    expect(spoken(clear)).toBe('Effacer la recherche')

    clear.click()

    expect(host.cleared).toBe(true)
    expect(document.activeElement).toBe(input)
  })
})
