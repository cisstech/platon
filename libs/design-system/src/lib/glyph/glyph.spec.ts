import { TestBed } from '@angular/core/testing'
import { Glyph, GlyphName } from './glyph'

describe('Glyph', () => {
  const render = (name: GlyphName) => {
    const fixture = TestBed.createComponent(Glyph)
    fixture.componentRef.setInput('name', name)
    fixture.detectChanges()
    return fixture
  }

  it.each(['course', 'activity', 'exercise', 'circle', 'paper'] as GlyphName[])(
    'draws the %s glyph with token colors',
    (name) => {
      const host: HTMLElement = render(name).nativeElement
      const svg = host.querySelector('svg')
      expect(svg?.getAttribute('viewBox')).toBe('0 0 48 48')
      expect(svg?.innerHTML).not.toMatch(/#[0-9a-f]{6}/i)
      expect(svg?.querySelector('[class^="g-"]')).not.toBeNull()
    }
  )

  it('is decorative, or an image when it has a label, at 40 or 56 px', () => {
    const fixture = render('course')
    const host: HTMLElement = fixture.nativeElement
    expect(host.getAttribute('aria-hidden')).toBe('true')
    expect(host.dataset['size']).toBe('1')

    fixture.componentRef.setInput('label', 'Cours')
    fixture.componentRef.setInput('size', 2)
    fixture.detectChanges()
    expect(host.getAttribute('role')).toBe('img')
    expect(host.getAttribute('aria-label')).toBe('Cours')
    expect(host.dataset['size']).toBe('2')
  })
})
