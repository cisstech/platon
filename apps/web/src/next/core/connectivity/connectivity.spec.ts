import { TestBed } from '@angular/core/testing'
import { Connectivity } from './connectivity'

describe('Connectivity', () => {
  const setOnline = (value: boolean) => {
    jest.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(value)
    window.dispatchEvent(new Event(value ? 'online' : 'offline'))
  }

  afterEach(() => jest.restoreAllMocks())

  it('follows what the browser knows of the network', () => {
    const connectivity = TestBed.inject(Connectivity)
    expect(connectivity.online()).toBe(true)
    setOnline(false)
    expect(connectivity.online()).toBe(false)
    setOnline(true)
    expect(connectivity.online()).toBe(true)
  })
})
