import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Topbar } from './topbar'

@Component({
  imports: [Button, Icon, Topbar],
  template: `
    <pl-topbar heading="Accueil">
      <button plButton plTopbarStart variant="cover-icon" aria-label="Ouvrir la navigation">
        <pl-icon name="menu" />
      </button>
    </pl-topbar>
  `,
})
class Host {}

describe('Topbar', () => {
  it('is the banner of a narrow screen, with its action before the title of the page', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const bar = fixture.nativeElement.querySelector('pl-topbar') as HTMLElement
    expect(bar.getAttribute('role')).toBe('banner')
    expect(bar.firstElementChild?.getAttribute('aria-label')).toBe('Ouvrir la navigation')
    expect(bar.querySelector('.pl-topbar__title')?.textContent).toBe('Accueil')
  })
})
