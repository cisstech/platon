import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, RouterLink, provideRouter } from '@angular/router'
import { Cover, CoverBrand, CoverCredit, CoverFoot, CoverItem, CoverNav, CoverProfile } from './cover'

@Component({ template: '' })
class Blank {}

@Component({
  imports: [Cover, CoverBrand, CoverCredit, CoverFoot, CoverItem, CoverNav, CoverProfile, RouterLink],
  template: `
    <pl-cover>
      <a plCoverBrand routerLink="/dashboard" [institution]="institution()">PLaTon</a>
      <pl-cover-nav label="Navigation principale">
        <a plCoverItem routerLink="/dashboard" icon="home">Accueil</a>
        <a plCoverItem routerLink="/courses" icon="school">Cours</a>
        <a plCoverItem routerLink="/corrections" icon="rate_review" [count]="count()" countLabel="copies à corriger">
          Corrections
        </a>
      </pl-cover-nav>
      <pl-cover-foot>
        <button plCoverProfile [person]="{ firstName: 'Karim', lastName: 'Haddad' }" detail="Compte enseignant">
          Karim Haddad
        </button>
        <a plCoverCredit href="https://github.com/cisstech/platon">Logiciel libre, par <strong>cisstech</strong></a>
      </pl-cover-foot>
    </pl-cover>
  `,
})
class Host {
  readonly institution = signal<string | undefined>('Université Gustave Eiffel')
  readonly count = signal(2)
}

describe('Cover', () => {
  const setup = async (url: string) => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: '**', component: Blank }])] })
    const fixture = TestBed.createComponent(Host)
    await TestBed.inject(Router).navigateByUrl(url)
    fixture.detectChanges()
    await fixture.whenStable()
    const el = fixture.nativeElement as HTMLElement
    /** What a screen reader reads: the text, without what is hidden from it. */
    const text = (selector: string) => {
      const clone = el.querySelector(selector)?.cloneNode(true) as HTMLElement | undefined
      clone?.querySelectorAll('[aria-hidden="true"]').forEach((node) => node.remove())
      return clone?.textContent?.replace(/\s+/g, ' ').trim()
    }
    return { fixture, el, text }
  }

  it('has its navigation as a named landmark', async () => {
    const { el } = await setup('/dashboard')
    const nav = el.querySelector('pl-cover-nav')
    expect(nav?.getAttribute('role')).toBe('navigation')
    expect(nav?.getAttribute('aria-label')).toBe('Navigation principale')
  })

  it('marks the entry of the current page, and keeps it under its children', async () => {
    const { text } = await setup('/courses/abc/members')
    expect(text('[aria-current="page"]')).toBe('Cours')
  })

  it('reads a count with what it counts, and hides an empty one', async () => {
    const { fixture, el, text } = await setup('/dashboard')
    expect(text('a[routerLink="/corrections"]')).toBe('Corrections 2 copies à corriger')
    fixture.componentInstance.count.set(0)
    fixture.detectChanges()
    expect(el.querySelector('a[routerLink="/corrections"] pl-count')).toBeNull()
  })

  it('names the institution under the brand, only when there is one', async () => {
    const { fixture, el, text } = await setup('/dashboard')
    expect(text('a[plCoverBrand]')).toBe('PLaTon Université Gustave Eiffel')
    fixture.componentInstance.institution.set(undefined)
    fixture.detectChanges()
    expect(el.querySelector('.pl-cover-brand__institution')).toBeNull()
  })

  it('shows the person with the type of account', async () => {
    const { text } = await setup('/dashboard')
    expect(text('button[plCoverProfile]')).toBe('Karim Haddad Compte enseignant')
  })
})

@Component({
  imports: [Cover, CoverBrand, CoverFoot, CoverProfile],
  template: `
    <pl-cover layout="panel">
      <a plCoverBrand href="/">PLaTon</a>
      <button plCoverClose type="button" aria-label="Fermer la navigation">x</button>
      <pl-cover-foot>
        <button plCoverProfile [person]="{ firstName: 'Inès', lastName: 'Benali' }">Inès Benali</button>
      </pl-cover-foot>
    </pl-cover>
  `,
})
class PanelHost {}

describe('Cover as a panel', () => {
  it('leaves the banner to the top bar, puts its close button beside the brand and opens a sheet', () => {
    const fixture = TestBed.createComponent(PanelHost)
    fixture.detectChanges()
    const cover = fixture.nativeElement.querySelector('pl-cover') as HTMLElement
    expect(cover.hasAttribute('role')).toBe(false)
    expect(cover.querySelector('.pl-cover__brand [plCoverClose]')).not.toBeNull()
    expect(cover.querySelector('.pl-cover-profile__chevron use')?.getAttribute('href')).toMatch(/#chevron_right$/)
  })
})
