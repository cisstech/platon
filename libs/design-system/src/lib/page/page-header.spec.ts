import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { Button } from '../button/button'
import { BREADCRUMB_LABEL, PageCrumb, PageFigure, PageHeader } from './page-header'

@Component({
  imports: [Button, PageFigure, PageHeader],
  template: `
    <pl-page-header heading="Algorithmique 1" [crumbs]="crumbs()" [description]="description()">
      <button plButton variant="primary" plPageActions>Ajouter une activité</button>
      <button plButton variant="secondary" plPageActions>Partager</button>
      <button plButton variant="icon" aria-label="Favori" plPageTitleAction>F</button>
      <pl-page-figure icon="groups" [value]="48">étudiants</pl-page-figure>
    </pl-page-header>
  `,
})
class Host {
  readonly crumbs = signal<PageCrumb[]>([])
  readonly description = signal<string | undefined>(undefined)
}

describe('PageHeader', () => {
  let fixture: ComponentFixture<Host>
  const el = () => fixture.nativeElement as HTMLElement

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: BREADCRUMB_LABEL, useValue: 'Fil d’Ariane' }],
    })
    fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
  })

  it('titles the page with a level 1 heading', () => {
    expect(el().querySelector('h1')?.textContent).toBe('Algorithmique 1')
  })

  it('has no breadcrumb at the first level', () => {
    fixture.componentInstance.crumbs.set([{ label: 'Cours' }])
    fixture.detectChanges()
    expect(el().querySelector('nav')).toBeNull()
  })

  it('links the parents and marks the current page from the second level', () => {
    fixture.componentInstance.crumbs.set([
      { label: 'Cours', link: '/courses' },
      { label: 'Algorithmique 1', link: '/courses/1' },
    ])
    fixture.detectChanges()
    const nav = el().querySelector('nav')
    expect(nav?.getAttribute('aria-label')).toBe('Fil d’Ariane')
    const links = nav?.querySelectorAll('a') ?? []
    expect([...links].map((a) => a.getAttribute('href'))).toEqual(['/courses'])
    expect(nav?.querySelector('[aria-current="page"]')?.textContent).toBe('Algorithmique 1')
  })

  it('puts the title action after the title, and the actions after both, in their order', () => {
    const row = el().querySelector('.pl-page-header__title-row')
    const labels = [...(row?.querySelectorAll('h1, button') ?? [])].map((node) => node.textContent?.trim())
    expect(labels).toEqual(['Algorithmique 1', 'F', 'Ajouter une activité', 'Partager'])
  })

  it('shows the description only when there is one, and the key figures', () => {
    expect(el().querySelector('.pl-page-header__description')).toBeNull()
    fixture.componentInstance.description.set('Licence 1, semestre 1.')
    fixture.detectChanges()
    expect(el().querySelector('.pl-page-header__description')?.textContent).toBe('Licence 1, semestre 1.')
    expect(el().querySelector('pl-page-figure')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('48 étudiants')
  })
})
