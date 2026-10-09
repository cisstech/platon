import { TestBed } from '@angular/core/testing'
import { StorageService } from '@platon/core/browser/shared'
import { of } from 'rxjs'
import { NextTheme } from './next-theme'

describe('NextTheme', () => {
  let saved: string | undefined
  const set = jest.fn()

  const theme = () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: StorageService,
          useValue: {
            getString: () => of(saved),
            set: (key: string, value: string) => (set(key, value), of(undefined)),
          },
        },
      ],
    })
    return TestBed.inject(NextTheme)
  }

  afterEach(() => {
    delete document.documentElement.dataset['theme']
    set.mockReset()
  })

  it('applies the theme saved by either interface', async () => {
    saved = 'dark'
    await theme().restore()
    expect(document.documentElement.dataset['theme']).toBe('dark')
  })

  it('lets the tokens follow the system for the system choice', async () => {
    saved = 'system'
    await theme().restore()
    expect(document.documentElement.dataset['theme']).toBeUndefined()
  })

  it('is light without a saved choice, as in the current interface', async () => {
    saved = undefined
    const service = theme()
    await service.restore()
    expect(service.preference()).toBe('light')
    expect(document.documentElement.dataset['theme']).toBe('light')
  })

  it('saves a new choice under the key of the current interface', async () => {
    saved = undefined
    await theme().choose('dark')
    expect(document.documentElement.dataset['theme']).toBe('dark')
    expect(set).toHaveBeenCalledWith('app.theme', 'dark')
  })
})
