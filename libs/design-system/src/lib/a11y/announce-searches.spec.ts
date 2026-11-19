import { LiveAnnouncer } from '@angular/cdk/a11y'
import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { announceSearches } from './announce-searches'

describe('announceSearches', () => {
  it('announces each answered search but the first list, and nothing while one loads', () => {
    const announce = jest.fn(() => Promise.resolve())
    TestBed.configureTestingModule({ providers: [{ provide: LiveAnnouncer, useValue: { announce } }] })
    const answered = signal<string | undefined>(undefined)
    const found = signal(3)
    TestBed.runInInjectionContext(() => announceSearches(answered, () => `${found()} cours`))
    const settle = () => TestBed.tick()

    answered.set('')
    settle()
    answered.set(undefined)
    settle()
    found.set(1)
    answered.set('algo')
    settle()
    answered.set('algo')
    settle()

    expect(announce.mock.calls).toEqual([['1 cours', 'polite']])
  })
})
