import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../testing/spoken'
import { CourseSection } from './course-section'

@Component({
  imports: [CourseSection],
  template: `
    <pl-course-section heading="Semaine 5" summary="3 activités" hue="lagoon" [collapsible]="collapsible()">
      <button plCourseSectionActions type="button" aria-label="Actions de la section Semaine 5">…</button>
      <p class="rows">TP 5</p>
    </pl-course-section>
  `,
})
class Host {
  readonly collapsible = signal(false)
}

describe('CourseSection', () => {
  const render = (collapsible = false) => {
    const fixture = TestBed.createComponent(Host)
    fixture.componentInstance.collapsible.set(collapsible)
    fixture.detectChanges()
    const section = fixture.nativeElement.querySelector('pl-course-section') as HTMLElement
    return { fixture, section }
  }

  it('is a divider in the hue of its course: its name and what it holds as a heading, its actions apart', () => {
    const { section } = render()

    expect(section.getAttribute('data-hue')).toBe('lagoon')
    expect(spoken(section.querySelector('h2'))).toBe('Semaine 5, 3 activités')
    expect(section.querySelector('button[plCourseSectionActions]')?.closest('h2')).toBeNull()
    expect(spoken(section.querySelector('.rows'))).toBe('TP 5')
  })

  it('folds under its divider, a button that says whether it is open', () => {
    const { fixture, section } = render(true)
    const toggle = section.querySelector('h2 button') as HTMLButtonElement
    const body = section.querySelector(`#${toggle.getAttribute('aria-controls')}`) as HTMLElement

    expect(spoken(toggle)).toBe('Semaine 5, 3 activités')
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(body.hidden).toBe(false)

    toggle.click()
    fixture.detectChanges()

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(body.hidden).toBe(true)
  })
})
