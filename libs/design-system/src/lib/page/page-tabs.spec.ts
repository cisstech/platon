import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, RouterLink, provideRouter } from '@angular/router'
import { PageTab, PageTabs } from './page-tabs'

@Component({
  imports: [PageTab, PageTabs, RouterLink],
  template: `
    <pl-page-tabs label="Onglets du cours">
      <a plPageTab routerLink="/course" icon="grid_view" [routerLinkActiveOptions]="{ exact: true }">Vue d'ensemble</a>
      <a plPageTab routerLink="/course/members" [count]="48">Membres</a>
    </pl-page-tabs>
  `,
})
class Host {}

@Component({ template: '' })
class Blank {}

describe('PageTabs', () => {
  const setup = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '**', component: Blank }])],
    })
    const fixture = TestBed.createComponent(Host)
    await TestBed.inject(Router).navigateByUrl(url)
    fixture.detectChanges()
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    const current = () => el.querySelector('[aria-current="page"]')?.textContent?.trim()
    return { el, current }
  }

  it('is a navigation named by its label', async () => {
    const { el } = await setup('/course')
    const nav = el.querySelector('pl-page-tabs')
    expect(nav?.getAttribute('role')).toBe('navigation')
    expect(nav?.getAttribute('aria-label')).toBe('Onglets du cours')
  })

  it('marks the tab of the current address', async () => {
    const { current } = await setup('/course')
    expect(current()).toBe("Vue d'ensemble")
  })

  it('keeps an exact tab from staying current under its children', async () => {
    const { current } = await setup('/course/members')
    expect(current()).toMatch(/^Membres\s*48$/)
  })
})
