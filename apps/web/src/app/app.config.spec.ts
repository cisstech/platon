import { TestBed } from '@angular/core/testing'
import { NOTIFICATION_PARSER } from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'
import { ResourceService } from '@platon/feature/resource/browser'
import { appConfig } from './app.config'

describe('appConfig', () => {
  beforeEach(() => {
    // jsdom has no media queries; the theme of the current interface reads one when it starts.
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })
    TestBed.configureTestingModule({ providers: appConfig({ flag: 'off', stored: null, bridged: false }).providers })
  })

  it('renders the notifications of resources in the drawer', () => {
    const parsers = TestBed.inject(NOTIFICATION_PARSER)
    const rendered = (type: string) => parsers.some((parser) => parser.support({ data: { type } } as Notification))

    expect(rendered('RESOURCE-EVENT')).toBe(true)
    expect(rendered('RESOURCE-INVITATION')).toBe(true)
  })

  it('reaches the resources', () => {
    expect(TestBed.inject(ResourceService)).toBeInstanceOf(ResourceService)
  })
})
