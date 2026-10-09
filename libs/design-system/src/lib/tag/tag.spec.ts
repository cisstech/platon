import { TestBed } from '@angular/core/testing'
import { Count } from '../count/count'
import { Tag } from './tag'

describe('Tag', () => {
  it('exposes its tone, and its hue only with the course tone', () => {
    const fixture = TestBed.createComponent(Tag)
    const host: HTMLElement = fixture.nativeElement
    fixture.componentRef.setInput('tone', 'success')
    fixture.componentRef.setInput('hue', 'mint')
    fixture.detectChanges()
    expect(host.dataset['tone']).toBe('success')
    expect(host.hasAttribute('data-hue')).toBe(false)

    fixture.componentRef.setInput('tone', 'course')
    fixture.detectChanges()
    expect(host.dataset['hue']).toBe('mint')
  })
})

describe('Count', () => {
  it('is read with its label inline, and hidden as a badge', () => {
    const fixture = TestBed.createComponent(Count)
    const host: HTMLElement = fixture.nativeElement
    fixture.componentRef.setInput('value', 14)
    fixture.detectChanges()
    expect(host.textContent).toBe('14')
    expect(host.hasAttribute('aria-hidden')).toBe(false)

    fixture.componentRef.setInput('variant', 'badge')
    fixture.detectChanges()
    expect(host.getAttribute('aria-hidden')).toBe('true')
  })
})
