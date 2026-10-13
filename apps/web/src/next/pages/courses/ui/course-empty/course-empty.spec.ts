import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../../../../shared/testing/spoken'
import { CourseTab, NoMatchView } from '../../courses.vm'
import { CourseEmpty } from './course-empty'

@Component({
  imports: [CourseEmpty],
  template: `<app-course-empty
    [tab]="tab()"
    [noMatch]="noMatch()"
    [admin]="admin()"
    [archived]="archived()"
    (cleared)="cleared = true"
  />`,
})
class Host {
  readonly tab = signal<CourseTab>('current')
  readonly noMatch = signal<NoMatchView | undefined>(undefined)
  readonly admin = signal(false)
  readonly archived = signal(1)
  cleared = false
}

describe('CourseEmpty', () => {
  const render = (values: Partial<{ tab: CourseTab; noMatch: NoMatchView; admin: boolean; archived: number }>) => {
    const fixture = TestBed.createComponent(Host)
    const host = fixture.componentInstance
    if (values.tab) host.tab.set(values.tab)
    if (values.noMatch) host.noMatch.set(values.noMatch)
    if (values.admin !== undefined) host.admin.set(values.admin)
    if (values.archived !== undefined) host.archived.set(values.archived)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement
    return { host, heading: spoken(element.querySelector('h2')), button: element.querySelector('button') }
  }

  it('says what found nothing, and clears it', () => {
    const { host, heading, button } = render({
      noMatch: { heading: 'Aucun cours mis à jour sur cette période.', clear: 'Voir toutes les périodes' },
    })

    expect(heading).toBe('Aucun cours mis à jour sur cette période.')
    expect(spoken(button)).toBe('Voir toutes les périodes')
    button?.click()
    expect(host.cleared).toBe(true)
  })

  it.each([
    [{ tab: 'archived' as const }, 'Aucun cours archivé'],
    [{ tab: 'platform' as const }, 'Aucun cours sur la plateforme'],
    [{ admin: true, archived: 0 }, 'Aucun cours dont vous êtes membre'],
    [{ admin: true, archived: 2 }, 'Aucun cours actuel'],
    [{}, 'Aucun cours actuel'],
  ])('says why the list is empty (%o): « %s »', (values, expected) => {
    const { heading, button } = render(values)

    expect(heading).toBe(expected)
    expect(button).toBeNull()
  })
})
