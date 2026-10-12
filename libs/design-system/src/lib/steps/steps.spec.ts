import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Button } from '../button/button'
import { Step } from './step/step'
import { Steps } from './steps'

@Component({
  imports: [Button, Step, Steps],
  template: `
    <pl-steps aria-label="Pour commencer">
      <pl-step heading="Créer votre cours" [current]="true">
        <p>Un cours rassemble vos étudiants et vos activités.</p>
        <a plButton variant="primary" plStepAction href="/courses/create">Créer un cours</a>
      </pl-step>
      <pl-step heading="Ajouter une activité">
        <p>Disponible dès que votre cours existe.</p>
      </pl-step>
    </pl-steps>
  `,
})
class Host {}

describe('Steps', () => {
  const render = () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    return { fixture, page: fixture.nativeElement as HTMLElement }
  }

  it('is a list of steps in order, the one to take now said as current', () => {
    const { page } = render()
    const steps = [...page.querySelectorAll('pl-step')]

    expect(page.querySelector('pl-steps')?.getAttribute('role')).toBe('list')
    expect(steps.map((step) => step.getAttribute('role'))).toEqual(['listitem', 'listitem'])
    expect(steps.map((step) => step.getAttribute('aria-current'))).toEqual(['step', null])
    expect(steps[0].querySelector('.pl-step__number')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('titles each step under the heading of its card', () => {
    const { page } = render()
    expect([...page.querySelectorAll('h3')].map((heading) => heading.textContent)).toEqual([
      'Créer votre cours',
      'Ajouter une activité',
    ])
  })

  it('puts its text, then what to do', () => {
    const { page } = render()
    const [first, second] = [...page.querySelectorAll('pl-step')]

    expect(first.querySelector('.pl-step__text')?.textContent?.trim()).toBe(
      'Un cours rassemble vos étudiants et vos activités.'
    )
    expect(first.querySelector('.pl-step__actions a')?.textContent).toBe('Créer un cours')
    expect(second.querySelector('.pl-step__actions a')).toBeNull()
  })
})
