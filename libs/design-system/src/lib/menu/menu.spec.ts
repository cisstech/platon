import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Button } from '../button/button'
import { Menu, MenuGroup, MenuItem, MenuTrigger } from './menu'

@Component({
  imports: [Button, Menu, MenuItem, MenuTrigger],
  template: `
    <button plButton variant="cover" [plMenuTrigger]="create">Créer</button>
    <pl-menu #create="ngMenu" (itemSelected)="selected = $event">
      <pl-menu-item value="course" icon="school" description="A space for your students.">Course</pl-menu-item>
      <pl-menu-item value="exercise" icon="code">Exercise</pl-menu-item>
      <pl-menu-item value="activity" icon="quiz">Activity</pl-menu-item>
      <pl-menu-item value="delete" icon="delete" tone="danger">Delete the section</pl-menu-item>
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

  it('marks a destructive entry', () => {
    expect(items()[3].dataset['tone']).toBe('danger')
    expect(items()[0].dataset['tone']).toBe('default')
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

@Component({
  imports: [Button, Menu, MenuGroup, MenuItem, MenuTrigger],
  template: `
    <button plButton [plMenuTrigger]="profile" #trigger="plMenuTrigger">Profil</button>
    <pl-menu #profile="ngMenu" (itemSelected)="selected = $event">
      <pl-menu-item value="account" icon="account_circle">Mon compte</pl-menu-item>
      <pl-menu-group label="Thème">
        <pl-menu-item value="light" role="menuitemradio" [checked]="theme === 'light'">Clair</pl-menu-item>
        <pl-menu-item value="dark" role="menuitemradio" [checked]="theme === 'dark'">Sombre</pl-menu-item>
      </pl-menu-group>
    </pl-menu>
  `,
})
class ChoiceHost {
  theme = 'light'
  selected?: string
}

describe('Menu with a set of choices', () => {
  let fixture: ComponentFixture<ChoiceHost>
  const items = () => [...document.querySelectorAll<HTMLElement>('pl-menu-item')]

  beforeEach(async () => {
    fixture = TestBed.createComponent(ChoiceHost)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
    await fixture.whenStable()
  })

  afterEach(() => {
    fixture.destroy()
    document.querySelector('.cdk-overlay-container')?.remove()
  })

  it('names the group and checks the current choice', () => {
    const group = document.querySelector('pl-menu-group') as HTMLElement
    expect(group.getAttribute('role')).toBe('group')
    expect(document.getElementById(group.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Thème')
    const [, light, dark] = items()
    expect(light.getAttribute('role')).toBe('menuitemradio')
    expect(light.getAttribute('aria-checked')).toBe('true')
    expect(dark.getAttribute('aria-checked')).toBe('false')
    expect(items()[0].hasAttribute('aria-checked')).toBe(false)
  })

  it('reaches the choices with the arrows, like any entry', async () => {
    const trigger = document.querySelector('button') as HTMLButtonElement
    trigger.click()
    fixture.detectChanges()
    await fixture.whenStable()
    key(document.activeElement as Element, 'ArrowDown')
    key(document.activeElement as Element, 'ArrowDown')
    fixture.detectChanges()
    expect(document.activeElement).toBe(items()[2])
    items()[2].click()
    expect(fixture.componentInstance.selected).toBe('dark')
  })

  it('opens from code, as after the charter', async () => {
    const trigger = fixture.debugElement.children[0].references['trigger'] as MenuTrigger
    trigger.open()
    fixture.detectChanges()
    await fixture.whenStable()
    expect(document.querySelector('pl-menu')?.getAttribute('data-visible')).toBe('true')
  })
})

@Component({
  imports: [Menu, MenuItem],
  template: `<pl-menu #orphan="ngMenu"><pl-menu-item value="a">A</pl-menu-item></pl-menu>`,
})
class OrphanHost {}

describe('Menu without a trigger', () => {
  it('stays hidden, where Angular Aria would show it in place', async () => {
    const fixture = TestBed.createComponent(OrphanHost)
    fixture.detectChanges()
    await fixture.whenStable()
    expect(document.querySelector('pl-menu')?.getAttribute('data-triggered')).toBe('false')
    fixture.destroy()
    document.querySelector('.cdk-overlay-container')?.remove()
  })
})
