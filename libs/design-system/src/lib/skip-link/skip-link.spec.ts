import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Page } from '../page/page'
import { SkipLink } from './skip-link'

@Component({
  imports: [Page, SkipLink],
  template: `
    <a plSkipLink>Aller au contenu</a>
    <pl-page><p>Contenu</p></pl-page>
  `,
})
class Host {}

describe('SkipLink', () => {
  it('moves the focus to the main landmark, without leaving the page', () => {
    const fixture = TestBed.createComponent(Host)
    document.body.appendChild(fixture.nativeElement)
    fixture.detectChanges()
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('#contenu')

    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(click)
    expect(click.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('main'))
    fixture.destroy()
  })
})
