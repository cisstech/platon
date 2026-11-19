import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { JoyMark } from './joy-mark'

@Component({
  imports: [JoyMark],
  template: `<h1><pl-joy-mark />Bienvenue sur PLaTon, Inès</h1>`,
})
class Host {}

describe('JoyMark', () => {
  it('lights an icon beside the words, without adding anything to what is read', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const mark = fixture.nativeElement.querySelector('pl-joy-mark') as HTMLElement

    expect(mark.getAttribute('aria-hidden')).toBe('true')
    expect(mark.querySelector('pl-icon')).not.toBeNull()
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Bienvenue sur PLaTon, Inès')
  })
})
