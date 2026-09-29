import { LiveAnnouncer } from '@angular/cdk/a11y'
import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { DEFAULT_TOAST_DURATION, Toaster } from './toaster'

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
