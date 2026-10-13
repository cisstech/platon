import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../../../../shared/testing/spoken'
import { CourseAction, CourseMenu } from './course-menu'

@Component({
  imports: [CourseMenu],
  template: `<app-course-menu
    course="AP1"
    [archivable]="archivable()"
    [archived]="archived()"
    [challenges]="challenges()"
    (chosen)="chosen = $event"
  />`,
})
class Host {
  readonly archivable = signal(true)
  readonly archived = signal(false)
  readonly challenges = signal(true)
  chosen?: CourseAction
}

describe('CourseMenu', () => {
  const render = () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)
    return { fixture, host: fixture.componentInstance }
  }
  const items = () =>
    [...document.querySelectorAll('pl-menu-item')].map((item) =>
      spoken(item.querySelector('[id^="pl-menu-item-title-"]'))
    )

  afterEach(() => (document.body.innerHTML = ''))

  it('offers to archive the course, for oneself only, and to see its challenges, under a named button', () => {
    const { host } = render()

    expect(spoken(document.querySelector('button'))).toBe('')
    expect(document.querySelector('button')?.getAttribute('aria-label')).toBe('Actions du cours AP1')
    expect(items()).toEqual(['Archiver', 'Voir les challenges'])
    expect(spoken(document.querySelector('pl-menu-item'))).toContain('Pour vous seulement')
    ;(document.querySelector('pl-menu-item') as HTMLElement).click()
    expect(host.chosen).toBe('archive')
  })

  it('brings back an archived course', () => {
    const { fixture, host } = render()
    host.archived.set(true)
    fixture.detectChanges()

    expect(items()).toEqual(['Désarchiver', 'Voir les challenges'])
  })

  it('has no button when nothing can be done', () => {
    const { fixture, host } = render()
    host.archivable.set(false)
    host.challenges.set(false)
    fixture.detectChanges()

    expect(document.querySelector('button')).toBeNull()
  })
})
