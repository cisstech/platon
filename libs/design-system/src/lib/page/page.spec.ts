import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Skeleton } from '../skeleton/skeleton'
import { PAGE_CONTENT_ID, Page, PageWidth } from './page'

@Component({
  imports: [Page, Skeleton],
  template: `
    <pl-page [width]="width()" [busy]="busy()">
      <pl-skeleton shape="heading" width="60%" />
    </pl-page>
  `,
})
class Host {
  readonly width = signal<PageWidth>('list')
  readonly busy = signal(true)
}

describe('Page', () => {
  it('is the main landmark, target of the skip link, busy while it loads', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const main = fixture.nativeElement.querySelector('main') as HTMLElement
    expect(main.id).toBe(PAGE_CONTENT_ID)
    expect(main.getAttribute('tabindex')).toBe('-1')
    expect(main.getAttribute('aria-busy')).toBe('true')

    fixture.componentInstance.busy.set(false)
    fixture.componentInstance.width.set('form')
    fixture.detectChanges()
    expect(main.hasAttribute('aria-busy')).toBe(false)
    expect(fixture.nativeElement.querySelector('pl-page').dataset['width']).toBe('form')
  })

  it('hides its skeletons from assistive technologies', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const skeleton = fixture.nativeElement.querySelector('pl-skeleton') as HTMLElement
    expect(skeleton.getAttribute('aria-hidden')).toBe('true')
    expect(skeleton.dataset['shape']).toBe('heading')
    expect(skeleton.style.inlineSize).toBe('60%')
  })
})
