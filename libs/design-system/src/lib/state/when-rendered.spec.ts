import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { whenRendered } from './when-rendered'

@Component({ template: `@if (shown()) {<button>Suivant</button>}` })
class Host {
  readonly shown = signal(false)
  readonly later = whenRendered()
}

describe('whenRendered', () => {
  it('runs a task once what it waits for has rendered', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    let found: Element | null = null

    fixture.componentInstance.shown.set(true)
    fixture.componentInstance.later(() => (found = fixture.nativeElement.querySelector('button')))
    fixture.detectChanges()

    expect(found).not.toBeNull()
  })

  it('runs nothing once the view is gone', () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const task = jest.fn()
    const later = fixture.componentInstance.later

    fixture.destroy()
    later(task)

    expect(task).not.toHaveBeenCalled()
  })
})
