import { Component, signal, viewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../../../../shared/testing/spoken'
import { DetailView } from '../../announcements.vm'
import { AnnouncementDetail } from './announcement-detail'

const DETAIL: DetailView = {
  id: 'a1',
  heading: 'Maintenance le 4 octobre',
  byline: 'Publiée le 25 septembre 2026 par Sophie Lambert, pour tout le monde',
  status: 'ready',
  summary: 'PLaTon sera indisponible dimanche.',
  content: { blocks: [{ type: 'paragraph', data: { text: 'Le serveur est mis à jour.' } }] },
}

@Component({
  imports: [AnnouncementDetail],
  template: `<app-announcement-detail [detail]="detail()" [titled]="titled()" (retry)="retried = true" />`,
})
class Host {
  readonly detail = signal<DetailView>(DETAIL)
  readonly titled = signal(true)
  readonly component = viewChild.required(AnnouncementDetail)
  retried = false
}

describe('AnnouncementDetail', () => {
  const render = (detail: Partial<DetailView> = {}, titled = true) => {
    const fixture = TestBed.createComponent(Host)
    fixture.componentInstance.detail.set({ ...DETAIL, ...detail })
    fixture.componentInstance.titled.set(titled)
    fixture.detectChanges()
    const element = fixture.nativeElement.querySelector('app-announcement-detail') as HTMLElement
    return { fixture, element, host: fixture.componentInstance }
  }

  it('is an article named by its title, then says when, by whom and for whom, then its content', () => {
    const { element } = render()

    expect(element.getAttribute('role')).toBe('article')
    expect(element.getAttribute('aria-labelledby')).toBe(element.querySelector('h2')?.id)
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Maintenance le 4 octobre')
    expect(spoken(element.querySelector('.announcement-detail__byline'))).toBe(DETAIL.byline)
    expect(spoken(element.querySelector('app-editor-content'))).toBe('Le serveur est mis à jour.')
  })

  it('leaves the title to its disclosure when it opens in place', () => {
    const { element } = render({}, false)

    expect(element.querySelector('h2')).toBeNull()
    expect(element.hasAttribute('role')).toBe(false)
  })

  it('shows the summary of an announcement without content', () => {
    const { element } = render({ content: undefined })

    expect(spoken(element.querySelector('.pl-prose'))).toBe('PLaTon sera indisponible dimanche.')
  })

  it('shows lines on their way while the content loads', () => {
    const { element } = render({ status: 'loading', content: undefined })

    expect(element.querySelector('pl-skeleton')).not.toBeNull()
    expect(element.querySelector('.pl-prose')).toBeNull()
  })

  it('says the content failed, and offers to try again', () => {
    const { element, host } = render({ status: 'error', content: undefined })

    const alert = element.querySelector('[role="alert"]')
    expect(spoken(alert?.querySelector('p'))).toBe("Cette annonce n'a pas pu être chargée.")
    const retry = alert?.querySelector('button') as HTMLButtonElement
    expect(spoken(retry)).toBe('Réessayer')
    retry.click()
    expect(host.retried).toBe(true)
  })

  it('takes the focus, to stay in the announcement once « Réessayer » goes', () => {
    const { element, host } = render({ status: 'error' })

    host.component().focus()

    expect(document.activeElement).toBe(element)
  })
})
