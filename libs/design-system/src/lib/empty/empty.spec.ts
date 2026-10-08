import { Component, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Button } from '../button/button'
import { GlyphName } from '../glyph/glyph'
import { IconName } from '../icon/icon-names'
import { Empty, EmptyTone } from './empty'

@Component({
  imports: [Button, Empty],
  template: `
    <pl-empty
      heading="Aucun cours pour l'instant"
      [level]="level()"
      [glyph]="glyph()"
      [icon]="icon()"
      [tone]="tone()"
      [compact]="compact()"
    >
      @if (text()) {
      <p>Un cours rassemble vos étudiants et vos activités.</p>
      } @if (action()) {
      <button plButton variant="secondary" plEmptyAction>Créer un cours</button>
      }
    </pl-empty>
  `,
})
class Host {
  readonly level = signal<2 | 3>(2)
  readonly glyph = signal<GlyphName | undefined>(undefined)
  readonly icon = signal<IconName | undefined>(undefined)
  readonly tone = signal<EmptyTone>('neutral')
  readonly compact = signal(false)
  readonly text = signal(true)
  readonly action = signal(true)
}

describe('Empty', () => {
  let fixture: ComponentFixture<Host>
  const el = () => fixture.nativeElement.querySelector('pl-empty') as HTMLElement
  const set = (change: (host: Host) => void) => {
    change(fixture.componentInstance)
    fixture.detectChanges()
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
  })

  it('draws the blank paper with token colors, as decoration', () => {
    const svg = el().querySelector('svg.pl-empty__illustration')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.innerHTML).not.toMatch(/#[0-9a-f]{6}/i)
    expect(el().dataset['figure']).toBe('illustration')
  })

  it('says what is empty in a heading, why, and what fills it', () => {
    expect(el().querySelector('h2')?.textContent).toBe("Aucun cours pour l'instant")
    expect(el().querySelector('.pl-empty__text p')).not.toBeNull()
    expect(el().querySelector('.pl-empty__actions button')?.textContent?.trim()).toBe('Créer un cours')
    set((host) => host.level.set(3))
    expect(el().querySelector('h3')).not.toBeNull()
  })

  it('shows the glyph of the object it would hold at 56 px', () => {
    set((host) => host.glyph.set('course'))
    expect(el().querySelector('pl-glyph')?.getAttribute('data-size')).toBe('2')
    expect(el().querySelector('.pl-empty__illustration')).toBeNull()
  })

  it('puts an icon in a pastille, red for an error', () => {
    set((host) => {
      host.glyph.set('course')
      host.icon.set('cloud_off')
      host.tone.set('danger')
    })
    expect(el().querySelector('pl-glyph')).toBeNull()
    expect(el().querySelector('.pl-empty__pastille')?.getAttribute('data-tone')).toBe('danger')
  })

  it('leaves no empty box without text or action', () => {
    set((host) => {
      host.text.set(false)
      host.action.set(false)
      host.compact.set(true)
    })
    expect(el().querySelector('.pl-empty__text')?.childElementCount).toBe(0)
    expect(el().querySelector('.pl-empty__actions')?.childElementCount).toBe(0)
    expect(el().hasAttribute('data-compact')).toBe(true)
  })
})
