import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { CourseHue } from '../hue/course-hue'
import { Progress } from './progress'

@Component({
  imports: [Progress],
  template: `<pl-progress [value]="value()" [max]="max()" [hue]="hue()" [label]="label()" [done]="done()" />`,
})
class Host {
  readonly value = signal(34)
  readonly max = signal(59)
  readonly hue = signal<CourseHue | undefined>('lagoon')
  readonly label = signal<string | undefined>('Votre avancement dans AP1')
  readonly done = signal(false)
}

describe('Progress', () => {
  const render = () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const bar = () => fixture.nativeElement.querySelector('pl-progress') as HTMLElement
    const fill = () => bar().querySelector('.pl-progress__fill') as HTMLElement
    return { fixture, host: fixture.componentInstance, bar, fill }
  }

  it('says its share to assistive technologies when it has a name, in the hue of its course', () => {
    const { bar, fill } = render()

    expect(bar().getAttribute('role')).toBe('progressbar')
    expect(bar().getAttribute('aria-label')).toBe('Votre avancement dans AP1')
    expect(bar().getAttribute('aria-valuenow')).toBe('58')
    expect(bar().getAttribute('aria-valuemin')).toBe('0')
    expect(bar().getAttribute('aria-valuemax')).toBe('100')
    expect(bar().dataset['hue']).toBe('lagoon')
    expect(fill().style.inlineSize).toBe('58%')
  })

  it('hides itself without a name: the text beside it says the same', () => {
    const { fixture, host, bar } = render()
    host.label.set(undefined)
    fixture.detectChanges()

    expect(bar().getAttribute('role')).toBeNull()
    expect(bar().getAttribute('aria-hidden')).toBe('true')
  })

  it('stays within its bounds, empty when there is nothing to measure', () => {
    const { fixture, host, fill } = render()
    host.value.set(80)
    fixture.detectChanges()
    expect(fill().style.inlineSize).toBe('100%')

    host.max.set(0)
    fixture.detectChanges()
    expect(fill().style.inlineSize).toBe('0%')
  })

  it('marks a finished measure, for the warmth of its fill', () => {
    const { fixture, host, bar } = render()
    host.done.set(true)
    fixture.detectChanges()

    expect(bar().hasAttribute('data-done')).toBe(true)
  })
})
