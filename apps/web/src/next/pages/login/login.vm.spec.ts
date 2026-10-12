import { HttpErrorResponse } from '@angular/common/http'
import {
  casEntries,
  coverFooter,
  coverSentence,
  failureAnnouncement,
  failureMessage,
  failureOf,
  signInTarget,
} from './login.vm'

describe('casEntries', () => {
  it('names the only institution account « compte université », and brings the next address along', () => {
    expect(casEntries(['univ-eiffel'], '/courses?tab=mine')).toEqual([
      {
        label: 'Continuer avec le compte université',
        href: '/api/v1/cas/login/univ-eiffel?next=%2Fcourses%3Ftab%3Dmine',
      },
    ])
  })

  it('gives each institution its button when there are several, and none without', () => {
    expect(casEntries(['eiffel', 'sorbonne'])).toEqual([
      { label: 'Continuer avec eiffel', href: '/api/v1/cas/login/eiffel' },
      { label: 'Continuer avec sorbonne', href: '/api/v1/cas/login/sorbonne' },
    ])
    expect(casEntries([])).toEqual([])
  })
})

describe('signInTarget', () => {
  it.each([
    ['/courses/1?tab=members', '/courses/1?tab=members'],
    [null, '/dashboard'],
    ['undefined', '/dashboard'],
    ['/login?next=%2Fcourses', '/dashboard'],
    ['https://elsewhere.example/', '/dashboard'],
    ['//elsewhere.example/', '/dashboard'],
  ])('leads %s to %s', (next, target) => {
    expect(signInTarget(next)).toBe(target)
  })
})

describe('failureOf', () => {
  const http = (status: number) => new HttpErrorResponse({ status })

  it('reads the refusal of the API as wrong credentials, the device being online or not', () => {
    expect(failureOf(http(400), true)).toBe('credentials')
    expect(failureOf(http(400), false)).toBe('credentials')
  })

  it('reads anything else as PLaTon not answering, or the connection lost, as every screen does', () => {
    expect(failureOf(http(404), true)).toBe('server')
    expect(failureOf(http(0), true)).toBe('server')
    expect(failureOf(http(502), true)).toBe('server')
    expect(failureOf(new Error('auth/not-connected'), true)).toBe('server')
    expect(failureOf(http(0), false)).toBe('offline')
  })
})

describe('failureMessage', () => {
  it('does not say which of the two was wrong, and points to the institution account when there is one', () => {
    expect(failureMessage('credentials', true)).toEqual({
      text: "Nom d'utilisateur ou mot de passe incorrect.",
      hint: 'Compte université\u00a0? Passez par le bouton du haut.',
    })
    expect(failureMessage('credentials', false).hint).toBeUndefined()
  })

  it('has its words for every other failure', () => {
    expect(failureMessage('missing', true).text).toBe("Saisissez votre nom d'utilisateur et votre mot de passe.")
    expect(failureMessage('token', true).text).toBe("Ce lien de connexion n'est plus valable.")
    expect(failureMessage('cas', true).text).toBe("La connexion par l'établissement n'a pas abouti.")
    expect(failureMessage('server', true).text).toBe('PLaTon ne répond pas pour le moment.')
    expect(failureMessage('offline', true).text).toBe('Votre appareil semble hors connexion.')
  })
})

describe('coverSentence', () => {
  it('names the institution, with the article before a common noun, eliding « de » before a vowel', () => {
    expect(coverSentence('Université Gustave Eiffel')).toMatch(
      /^PLaTon est la plateforme d'exercices de l'Université Gustave Eiffel\. Les enseignants/
    )
    expect(coverSentence('École Centrale')).toMatch(/^PLaTon est la plateforme d'exercices de l'École Centrale\./)
    expect(coverSentence('Aix-Marseille Université')).toMatch(
      /^PLaTon est la plateforme d'exercices d'Aix-Marseille Université\./
    )
    expect(coverSentence('Sorbonne Université')).toMatch(
      /^PLaTon est la plateforme d'exercices de Sorbonne Université\./
    )
  })

  it('speaks of a platform without one', () => {
    expect(coverSentence(undefined)).toMatch(/^PLaTon est une plateforme d'exercices\. Les enseignants/)
  })
})

describe('coverFooter', () => {
  it('names the institution before the free software, when there is one', () => {
    expect(coverFooter('Université Gustave Eiffel')).toBe('Université Gustave Eiffel. Logiciel libre, cisstech.')
    expect(coverFooter(undefined)).toBe('Logiciel libre, cisstech.')
  })
})

describe('failureAnnouncement', () => {
  it('reads the failure, then what to do', () => {
    expect(
      failureAnnouncement({ text: "Ce lien de connexion n'est plus valable.", hint: 'Connectez-vous ci-dessous.' })
    ).toBe("Ce lien de connexion n'est plus valable. Connectez-vous ci-dessous.")
    expect(failureAnnouncement({ text: 'Saisissez votre nom.' })).toBe('Saisissez votre nom.')
  })
})
