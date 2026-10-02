import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Button } from '../button/button'
import { Menu, MenuItem, MenuTrigger } from './menu'

@Component({
  imports: [Button, Menu, MenuItem, MenuTrigger],
  template: `
    <button plButton variant="cover" [plMenuTrigger]="create">Créer</button>
    <pl-menu #create="ngMenu" (itemSelected)="selected = $event">
      <pl-menu-item value="course" icon="school" description="A space for your students.">Course</pl-menu-item>
      <pl-menu-item value="exercise" icon="code">Exercise</pl-menu-item>
      <pl-menu-item value="activity" icon="quiz">Activity</pl-menu-item>
    </pl-menu>
  `,
})
class Host {
  selected?: string
}

const key = (target: Element, name: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))

describe('Menu', () => {
  let fixture: ComponentFixture<Host>
  const trigger = () => document.querySelector('button') as HTMLButtonElement
  const menu = () => document.querySelector('pl-menu') as HTMLElement
  const items = () => [...document.querySelectorAll<HTMLElement>('pl-menu-item')]

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
    await fixture.whenStable()
  })

  afterEach(() => {
    fixture.destroy()
    document.querySelector('.cdk-overlay-container')?.remove()
  })

  const open = async () => {
    trigger().click()
    fixture.detectChanges()
    await fixture.whenStable()
  }

  it('lives in an overlay pane and starts closed', () => {
    expect(menu().closest('.cdk-overlay-pane')).not.toBeNull()
    expect(menu().getAttribute('role')).toBe('menu')
    expect(menu().getAttribute('data-visible')).toBe('false')
    expect(trigger().getAttribute('aria-haspopup')).toBe('true')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('opens on the first entry', async () => {
    await open()
    expect(menu().getAttribute('data-visible')).toBe('true')
    expect(trigger().getAttribute('aria-expanded')).toBe('true')
    expect(items()[0].getAttribute('data-active')).toBe('true')
    expect(document.activeElement).toBe(items()[0])
  })

  it('moves between entries with the arrows', async () => {
    await open()
    key(document.activeElement as Element, 'ArrowDown')
    fixture.detectChanges()
    expect(items()[1].getAttribute('data-active')).toBe('true')
    expect(document.activeElement).toBe(items()[1])
  })

  it('closes on Escape and gives the focus back to the trigger', async () => {
    await open()
    key(document.activeElement as Element, 'Escape')
    fixture.detectChanges()
    await fixture.whenStable()
    expect(menu().getAttribute('data-visible')).toBe('false')
    expect(document.activeElement).toBe(trigger())
  })

  it('emits the value of the chosen entry and closes', async () => {
    await open()
    items()[2].click()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(fixture.componentInstance.selected).toBe('activity')
    expect(menu().getAttribute('data-visible')).toBe('false')
  })

  it('names an entry by its title and describes it by its description', () => {
    const [course, exercise] = items()
    expect(course.getAttribute('role')).toBe('menuitem')
    expect(document.getElementById(course.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Course')
    const description = document.getElementById(course.getAttribute('aria-describedby') ?? '')
    expect(description?.textContent).toBe('A space for your students.')
    expect(exercise.hasAttribute('aria-describedby')).toBe(false)
  })
})
