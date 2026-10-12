import { LiveAnnouncer } from '@angular/cdk/a11y'
import { HttpErrorResponse } from '@angular/common/http'
import { signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { NEVER, Observable, of, throwError } from 'rxjs'
import { Connectivity } from '../../core/connectivity/connectivity'
import { INSTITUTION_NAME, PRESENTATION_URL } from '../../core/institution/institution'
import { Session } from '../../core/session/session'
import { Login } from './login'
import { LoginApi } from './login-api'
import { LoginStore } from './login-store'

/** Lets the promises of the store settle. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve))

const words = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim()

describe('Login', () => {
  let session: { signIn: jest.Mock }
  let announce: jest.Mock
  let navigateByUrl: jest.SpyInstance

  const render = async ({
    cas = ['univ-eiffel'] as string[] | Observable<string[]>,
    institution = 'Université Gustave Eiffel' as string | undefined,
    presentation = 'https://video.example/platon' as string | undefined,
    inputs = {} as Record<string, string>,
  } = {}) => {
    session = { signIn: jest.fn().mockResolvedValue({ id: 'u1' }) }
    announce = jest.fn().mockResolvedValue(undefined)
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        LoginStore,
        { provide: Session, useValue: session },
        { provide: LoginApi, useValue: { casNames: () => (Array.isArray(cas) ? of(cas) : cas) } },
        { provide: Connectivity, useValue: { online: signal(true) } },
        { provide: INSTITUTION_NAME, useValue: institution },
        { provide: PRESENTATION_URL, useValue: presentation },
        { provide: LiveAnnouncer, useValue: { announce } },
      ],
    })
    navigateByUrl = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true)
    const fixture = TestBed.createComponent(Login)
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value)
    fixture.detectChanges()
    await settle()
    fixture.detectChanges()
    document.body.appendChild(fixture.nativeElement)
    return { fixture, page: fixture.nativeElement as HTMLElement }
  }

  afterEach(() => document.body.querySelectorAll('app-login').forEach((page) => page.remove()))

  const submit = async (fixture: ComponentFixture<Login>, page: HTMLElement, username: string, password: string) => {
    const [user, secret] = page.querySelectorAll('input')
    user.value = username
    secret.value = password
    page.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }))
    fixture.detectChanges()
    await settle()
    fixture.detectChanges()
    await fixture.whenStable()
  }

  it('says what PLaTon is on its cover, then asks to sign in', async () => {
    const { page } = await render()

    expect(words(page.querySelector('h1'))).toBe('Des exercices qui corrigent, des cours qui suivent.')
    expect(words(page.querySelector('.login__cover p'))).toContain("la plateforme d'exercices de l'Université")
    expect(words(page.querySelector('h2'))).toBe('Se connecter')
    expect(page.querySelector('a[plSkipLink]')?.getAttribute('href')).toBe('#contenu')
    expect(page.querySelector('#contenu form')).not.toBeNull()
  })

  it('offers the institution account first, bringing the next address along', async () => {
    const { page } = await render({ inputs: { next: '/courses' } })

    const cas = page.querySelector('a.login__cas') as HTMLAnchorElement
    expect(words(cas)).toBe('Continuer avec le compte université')
    expect(cas.getAttribute('href')).toBe('/api/v1/cas/login/univ-eiffel?next=%2Fcourses')
    expect(words(page.querySelector('.login__or'))).toBe('ou avec un compte PLaTon')
  })

  it('shows neither institution button nor separator without an institution account', async () => {
    const { page } = await render({ cas: [] })

    expect(page.querySelector('a.login__cas')).toBeNull()
    expect(page.querySelector('.login__or')).toBeNull()
  })

  it('signs in, then opens the next address in place of the sign-in page', async () => {
    const { fixture, page } = await render({ inputs: { next: '/courses/1' } })

    await submit(fixture, page, 'sophie.lambert', 'secret')

    expect(session.signIn).toHaveBeenCalledWith('sophie.lambert', 'secret')
    expect(navigateByUrl).toHaveBeenCalledWith('/courses/1', { replaceUrl: true })
  })

  it('says it works on its button, and holds the institution account meanwhile', async () => {
    const { fixture, page } = await render()
    session.signIn.mockReturnValue(new Promise(() => undefined))

    await submit(fixture, page, 'sophie.lambert', 'secret')

    const button = page.querySelector('button[type="submit"]') as HTMLButtonElement
    expect(words(button)).toBe('Connexion en cours')
    expect(button.getAttribute('aria-busy')).toBe('true')
    const cas = page.querySelector('a.login__cas') as HTMLAnchorElement
    expect(cas.getAttribute('aria-disabled')).toBe('true')
    expect(cas.dispatchEvent(new MouseEvent('click', { cancelable: true }))).toBe(false)
    expect(announce).toHaveBeenCalledWith('Connexion en cours.', 'polite')
  })

  it('gives the focus to the username when it is empty', async () => {
    const { fixture, page } = await render()

    await submit(fixture, page, '', 'secret')

    expect(document.activeElement).toBe(page.querySelector('input[name="username"]'))
    expect(session.signIn).not.toHaveBeenCalled()
  })

  it('keeps the place of the institution account while it loads, and says when it cannot', async () => {
    const pending = await render({ cas: NEVER })
    expect(pending.page.querySelector('.login__cas-pending')).not.toBeNull()
    TestBed.resetTestingModule()

    const failed = await render({ cas: throwError(() => new Error('down')) })
    expect(words(failed.page.querySelector('.login__cas-failure'))).toBe(
      "La connexion par l'établissement est indisponible pour le moment. Réessayer"
    )
  })

  it('makes only the first institution account the main button', async () => {
    const { page } = await render({ cas: ['eiffel', 'sorbonne'] })

    const variants = [...page.querySelectorAll('a.login__cas')].map((cas) => cas.getAttribute('data-variant'))
    expect(variants).toEqual(['primary', 'secondary'])
  })

  it('says refused credentials under the password, marks both fields, and gives the password the focus', async () => {
    const { fixture, page } = await render()
    session.signIn.mockRejectedValue(new HttpErrorResponse({ status: 400 }))

    await submit(fixture, page, 'ines.benali', 'wrong')

    const [user, secret] = page.querySelectorAll('input')
    const message = page.querySelector('#login-message')
    expect(words(message)).toBe(
      "Nom d'utilisateur ou mot de passe incorrect. Compte université ? Passez par le bouton du haut."
    )
    expect(user.getAttribute('aria-invalid')).toBe('true')
    expect(secret.getAttribute('aria-invalid')).toBe('true')
    expect(user.getAttribute('aria-describedby')).toBe('login-message')
    expect(document.activeElement).toBe(secret)
  })

  it('starts with the failure the address brings back, and reads it out', async () => {
    const { page } = await render({ inputs: { error: 'cas' } })

    expect(words(page.querySelector('#login-message'))).toContain("La connexion par l'établissement n'a pas abouti.")
    expect(announce).toHaveBeenCalledWith(
      "La connexion par l'établissement n'a pas abouti. Réessayez, ou utilisez un compte PLaTon.",
      'polite'
    )
  })

  it('links the presentation only when it is given, and speaks of a platform without an institution', async () => {
    const withLink = await render()
    expect(withLink.page.querySelector('a[href="https://video.example/platon"]')).not.toBeNull()
    TestBed.resetTestingModule()

    const without = await render({ presentation: '', institution: '' })
    expect(words(without.page.querySelector('.login__cover'))).not.toContain('Voir la présentation')
    expect(words(without.page.querySelector('.login__cover p'))).toContain("une plateforme d'exercices")
  })
})
