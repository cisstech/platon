import { LiveAnnouncer } from '@angular/cdk/a11y'
import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { DEFAULT_TOAST_DURATION, TOAST_INSET_START, Toaster } from './toaster'

describe('Toaster', () => {
  let toaster: Toaster
  let announce: jest.Mock

  beforeEach(() => {
    announce = jest.fn().mockResolvedValue(undefined)
    TestBed.configureTestingModule({ providers: [{ provide: LiveAnnouncer, useValue: { announce } }] })
    toaster = TestBed.inject(Toaster)
  })

  afterEach(() => document.querySelector('pl-toast-stack')?.remove())

  const shownToasts = () => {
    TestBed.inject(Toaster)
    TestBed.tick()
    return [...document.querySelectorAll('pl-toast')].map((toast) => toast.textContent?.trim())
  }

  it('shows the toast in a labelled region of the page', () => {
    toaster.show({ tone: 'success', message: 'Exercice enregistré' })
    expect(shownToasts()).toEqual(['Exercice enregistré'])
    expect(document.querySelector('pl-toast-stack')?.getAttribute('role')).toBe('region')
    expect(document.querySelector('pl-toast-stack')?.getAttribute('aria-label')).toBe('Notifications')
  })

  it('sits at the bottom left of the page, off the frame the application gives', () => {
    toaster.show({ message: 'Exercice enregistré' })
    shownToasts()
    const stack = document.querySelector('pl-toast-stack') as HTMLElement
    expect(stack.style.getPropertyValue('--pl-toast-inset-start')).toBe('0px')
  })

  it('rises above a dialog opened before it, the top layer ranking by the order things show', () => {
    const shown: string[] = []
    const proto = HTMLElement.prototype as HTMLElement & { showPopover?: () => void; hidePopover?: () => void }
    const { showPopover, hidePopover } = proto
    proto.showPopover = function (this: HTMLElement) {
      shown.push(this.localName)
    }
    proto.hidePopover = jest.fn()

    toaster.show({ tone: 'danger', message: "Vos notifications n'ont pas pu être supprimées." })
    shownToasts()

    expect(document.querySelector('pl-toast-stack')?.getAttribute('popover')).toBe('manual')
    expect(shown).toEqual(['pl-toast-stack'])
    proto.showPopover = showPopover
    proto.hidePopover = hidePopover
  })

  it('announces the title and the message, errors assertively', () => {
    toaster.show({ tone: 'info', title: 'Nouvelle version', message: 'Rechargez la page' })
    toaster.show({ tone: 'danger', message: 'Enregistrement impossible' })
    expect(announce).toHaveBeenNthCalledWith(1, 'Nouvelle version. Rechargez la page', 'polite')
    expect(announce).toHaveBeenNthCalledWith(2, 'Enregistrement impossible', 'assertive')
  })

  it('goes away after its duration, and stays with a duration of 0', fakeAsync(() => {
    toaster.show({ message: 'Temporaire' })
    toaster.show({ message: 'Permanent', duration: 0 })
    tick(DEFAULT_TOAST_DURATION)
    expect(toaster.toasts().map((toast) => toast.options.message)).toEqual(['Permanent'])
  }))

  it('keeps a toast with an action until it is closed, and closes it once the action runs', fakeAsync(() => {
    const run = jest.fn()
    toaster.show({
      message: 'Gaëlle Picard ne fait plus partie du cours.',
      action: { label: 'Annuler', icon: 'undo', run },
      dismissLabel: 'Fermer la notification',
    })
    tick(DEFAULT_TOAST_DURATION * 3)
    expect(toaster.toasts()).toHaveLength(1)
    TestBed.tick()
    const action = [...document.querySelectorAll<HTMLButtonElement>('pl-toast-stack button')].find(
      (button) => button.textContent?.trim() === 'Annuler'
    ) as HTMLButtonElement
    action.click()
    expect(run).toHaveBeenCalledTimes(1)
    expect(toaster.toasts()).toEqual([])
  }))

  it('confirms with a neutral check, not the icon of success', () => {
    toaster.show({ tone: 'success', message: 'Exercice enregistré' })
    TestBed.tick()
    expect(document.querySelector('pl-toast .pl-toast__icon use')?.getAttribute('href')).toMatch(/#check$/)
  })

  it('closes through its reference', () => {
    const toast = toaster.show({ message: 'Envoi en cours', duration: 0 })
    toast.dismiss()
    expect(toaster.toasts()).toEqual([])
  })

  it('waits while held by the pointer or the focus, then restarts its full duration', fakeAsync(() => {
    toaster.show({ message: 'À lire' })
    tick(DEFAULT_TOAST_DURATION - 1)
    toaster.hold('pointer', true)
    toaster.hold('focus', true)
    toaster.hold('pointer', false)
    tick(DEFAULT_TOAST_DURATION)
    expect(toaster.toasts()).toHaveLength(1)
    toaster.hold('focus', false)
    tick(DEFAULT_TOAST_DURATION)
    expect(toaster.toasts()).toHaveLength(0)
  }))

  it('never runs two timers for one toast', fakeAsync(() => {
    toaster.show({ message: 'À lire' })
    toaster.hold('pointer', false)
    toaster.hold('pointer', true)
    tick(DEFAULT_TOAST_DURATION)
    expect(toaster.toasts()).toHaveLength(1)
    toaster.hold('pointer', false)
    tick(DEFAULT_TOAST_DURATION)
    expect(toaster.toasts()).toHaveLength(0)
  }))

  it('moves the focus to the next toast when one is closed from the keyboard, then releases it', fakeAsync(() => {
    toaster.show({ message: 'Premier', duration: 0, dismissLabel: 'Fermer' })
    toaster.show({ message: 'Second', dismissLabel: 'Fermer' })
    TestBed.tick()
    const closeButtons = () => [...document.querySelectorAll<HTMLButtonElement>('pl-toast-stack button')]
    closeButtons()[0].focus()
    closeButtons()[0].click()
    TestBed.tick()
    expect(document.activeElement).toBe(closeButtons()[0])
    expect(toaster.toasts().map((toast) => toast.options.message)).toEqual(['Second'])

    closeButtons()[0].click()
    TestBed.tick()
    toaster.show({ message: 'Suivant' })
    tick(DEFAULT_TOAST_DURATION)
    expect(toaster.toasts()).toEqual([])
  }))
})

describe('Toaster beside a cover', () => {
  afterEach(() => document.querySelector('pl-toast-stack')?.remove())

  it('starts after the cover', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LiveAnnouncer, useValue: { announce: jest.fn().mockResolvedValue(undefined) } },
        { provide: TOAST_INSET_START, useValue: 'var(--pl-cover-width)' },
      ],
    })
    TestBed.inject(Toaster).show({ message: 'Cours créé' })
    TestBed.tick()
    const stack = document.querySelector('pl-toast-stack') as HTMLElement
    expect(stack.style.getPropertyValue('--pl-toast-inset-start')).toBe('var(--pl-cover-width)')
  })
})
