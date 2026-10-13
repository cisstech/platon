import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { CourseHue } from '../hue/course-hue'
import { CourseMark, CourseMarkSize } from './course-mark'

@Component({
  imports: [CourseMark],
  template: `<pl-course-mark monogram="AP1" [hue]="hue()" [size]="size()" />`,
})
class Host {
  readonly hue = signal<CourseHue>('lagoon')
  readonly size = signal<CourseMarkSize>('md')
}

describe('CourseMark', () => {
  it('shows the monogram of a course in its hue, beside a name that says it', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const mark = fixture.nativeElement.querySelector('pl-course-mark') as HTMLElement

    expect(mark.textContent?.trim()).toBe('AP1')
    expect(mark.getAttribute('data-hue')).toBe('lagoon')
    expect(mark.getAttribute('aria-hidden')).toBe('true')
    expect(mark.getAttribute('data-size')).toBe('md')

    fixture.componentInstance.size.set('sm')
    fixture.detectChanges()
    expect(mark.getAttribute('data-size')).toBe('sm')
  })
})
