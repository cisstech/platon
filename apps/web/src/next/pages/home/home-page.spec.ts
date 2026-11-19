import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Announcement } from '@platon/feature/announcement/common'
import { offeredBanner } from './home-page'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)

describe('offeredBanner', () => {
  const announcement = (id: string, day: number) =>
    ({ id, title: id, description: '', createdAt: at(day, 8), active: true } as Announcement)

  @Component({ template: '' })
  class Host {
    readonly announcements = signal<Announcement[] | undefined>(undefined)
    readonly read = signal<ReadonlySet<string>>(new Set())
    readonly shown = offeredBanner(this.announcements, this.read, NOW)
  }

  it('keeps the announcement chosen when they came: closing it shows no other', () => {
    const host = TestBed.createComponent(Host).componentInstance
    expect(host.shown()).toBeUndefined()

    host.announcements.set([announcement('recent', 27), announcement('older', 26)])
    expect(host.shown()?.id).toBe('recent')

    host.read.set(new Set(['recent']))
    expect(host.shown()).toBeUndefined()
  })
})
