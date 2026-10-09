import { Component, LOCALE_ID, signal, viewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { NotificationItem, NotificationList } from './notification'

@Component({
  imports: [NotificationItem, NotificationList],
  template: `
    <pl-notification-list>
      <pl-notification-item
        heading="La correction de TP 3 est disponible"
        [context]="context()"
        [date]="date"
        icon="rate_review"
        hue="lagoon"
        [unread]="unread()"
        unreadLabel="Non lue :"
        [href]="href()"
        [choosable]="choosable()"
        (chosen)="choose($event)"
      >
        <button type="button" plNotificationActions>Accepter</button>
      </pl-notification-item>
    </pl-notification-list>
  `,
})
class Host {
  readonly item = viewChild.required(NotificationItem)
  readonly date = new Date(Date.now() - 2 * 60 * 60_000)
  readonly context = signal<string | undefined>('Algorithmique')
  readonly unread = signal(true)
  readonly choosable = signal(false)
  readonly href = signal<string | undefined>('/resources/r1/settings?tab=members')
  readonly chosen: MouseEvent[] = []

  choose(event: MouseEvent) {
    event.preventDefault()
    this.chosen.push(event)
  }
}

const words = (element: Element | null) => element?.textContent?.replace(/\s+/g, ' ').trim()

describe('NotificationItem', () => {
  const render = () => {
    TestBed.configureTestingModule({
      providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }],
    })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const item = fixture.nativeElement.querySelector('pl-notification-item') as HTMLElement
    return { fixture, item, host: fixture.componentInstance }
  }

  it('reads as one unread fact, its course and when, in a list', () => {
    const { item, fixture } = render()

    expect(fixture.nativeElement.querySelector('pl-notification-list').getAttribute('role')).toBe('list')
    expect(item.getAttribute('role')).toBe('listitem')
    expect(words(item.querySelector('a'))).toBe(
      'Non lue : La correction de TP 3 est disponible Algorithmique, il y a 2 h'
    )
    expect(item.querySelector('time')?.getAttribute('datetime')).toMatch(/^\d{4}-\d\d-\d\dT/)
    expect(item.querySelector('.pl-notification-item__lead')?.getAttribute('data-hue')).toBe('lagoon')
  })

  it('says nothing of its state once read', () => {
    const { item, fixture, host } = render()
    host.unread.set(false)
    fixture.detectChanges()

    expect(item.hasAttribute('data-unread')).toBe(false)
    expect(words(item.querySelector('a'))).toBe('La correction de TP 3 est disponible Algorithmique, il y a 2 h')
  })

  it('starts the line with the date when no course is named', () => {
    const { item, fixture, host } = render()
    host.context.set(undefined)
    fixture.detectChanges()

    expect(words(item.querySelector('.pl-notification-item__detail'))).toBe('Il y a 2 h')
  })

  it('is a link, and lets the page act before it opens', () => {
    const { item, host } = render()
    const link = item.querySelector('a') as HTMLAnchorElement

    expect(link.getAttribute('href')).toBe('/resources/r1/settings?tab=members')
    link.click()
    expect(host.chosen).toHaveLength(1)
    expect(host.chosen[0].defaultPrevented).toBe(true)
  })

  it('is a button without a link when the page can do something with it', () => {
    const { item, fixture, host } = render()
    host.href.set(undefined)
    host.choosable.set(true)
    fixture.detectChanges()

    const button = item.querySelector('button.pl-notification-item__main') as HTMLButtonElement
    expect(words(button)).toBe('Non lue : La correction de TP 3 est disponible Algorithmique, il y a 2 h')
    button.click()
    expect(host.chosen).toHaveLength(1)
  })

  it('only informs without a link, its actions still at hand', () => {
    const { item, fixture, host } = render()
    host.href.set(undefined)
    fixture.detectChanges()

    expect(item.querySelector('a, .pl-notification-item__main:is(button), [tabindex]:not([tabindex="-1"])')).toBeNull()
    expect(words(item.querySelector('.pl-notification-item__actions'))).toBe('Accepter')
  })

  it('takes the focus as a row that only informs, out of the tab order', () => {
    const { item, fixture, host } = render()
    host.href.set(undefined)
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)

    host.item().focus()

    expect(document.activeElement).toBe(item.querySelector('.pl-notification-item__main'))
    expect(document.activeElement?.getAttribute('tabindex')).toBe('-1')
    fixture.nativeElement.remove()
  })

  it('tells the page of a middle click, which opens the link aside, and not of a right click', () => {
    const { item, host } = render()
    const link = item.querySelector('a') as HTMLAnchorElement

    link.dispatchEvent(new MouseEvent('auxclick', { button: 2, bubbles: true }))
    link.dispatchEvent(new MouseEvent('auxclick', { button: 1, bubbles: true }))

    expect(host.chosen.map((event) => event.button)).toEqual([1])
  })

  it('names its title, for the actions it describes', () => {
    const { item } = render()

    const title = item.querySelector('.pl-notification-item__title') as HTMLElement
    expect(title.id).toMatch(/^pl-notification-title-\d+$/)
  })
})
