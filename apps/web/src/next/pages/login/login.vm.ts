import { HttpErrorResponse } from '@angular/common/http'
import { casSignInUrl } from '@platon/feature/cas/common'
import { failureCause } from '../../shared/load-state/load-state'

/** Why a sign-in did not happen. */
export type SignInFailure = 'missing' | 'credentials' | 'token' | 'cas' | 'server' | 'offline'

export interface CasEntry {
  readonly label: string
  readonly href: string
}

export interface FailureMessage {
  readonly text: string
  /** What to do next, when there is something to do. */
  readonly hint?: string
}

const HOME = '/dashboard'

/**
 * The institution accounts, by the names the API gives: one is « le compte université », several
 * are told apart by their name. Each leads to the CAS, which brings the person back to `next`.
 */
export const casEntries = (names: readonly string[], next?: string | null): CasEntry[] =>
  names.map((name) => ({
    label: names.length > 1 ? `Continuer avec ${name}` : 'Continuer avec le compte université',
    href: casSignInUrl(name, next),
  }))

/**
 * Where to go once signed in: `next` when it is an address of PLaTon other than the sign-in page,
 * home otherwise. An address of another site is never followed.
 */
export const signInTarget = (next: string | null | undefined): string =>
  next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') ? next : HOME

/**
 * The failure a refused sign-in stands for: the API answers 400 to both wrong fields alike; any other
 * failure is PLaTon not answering, or the connection lost, told apart as on every screen.
 */
export const failureOf = (error: unknown, online: boolean): SignInFailure =>
  error instanceof HttpErrorResponse && error.status === 400 ? 'credentials' : failureCause(online)

/** The words of a failure; refused credentials point to the institution account when there is one. */
export const failureMessage = (failure: SignInFailure, withCas: boolean): FailureMessage => {
  switch (failure) {
    case 'missing':
      return { text: "Saisissez votre nom d'utilisateur et votre mot de passe." }
    case 'credentials':
      return {
        text: "Nom d'utilisateur ou mot de passe incorrect.",
        hint: withCas ? 'Compte université\u00a0? Passez par le bouton du haut.' : undefined,
      }
    case 'token':
      return { text: "Ce lien de connexion n'est plus valable.", hint: 'Connectez-vous ci-dessous.' }
    case 'cas':
      return {
        text: "La connexion par l'établissement n'a pas abouti.",
        hint: 'Réessayez, ou utilisez un compte PLaTon.',
      }
    case 'server':
      return { text: 'PLaTon ne répond pas pour le moment.', hint: 'Réessayez dans un instant.' }
    case 'offline':
      return { text: 'Votre appareil semble hors connexion.', hint: 'Vérifiez le réseau, puis réessayez.' }
  }
}

/** The message read out by screen readers: the failure, then what to do. */
export const failureAnnouncement = ({ text, hint }: FailureMessage): string => (hint ? `${text} ${hint}` : text)

/** The common nouns an institution name starts with, which take the article: « l'Université ». */
const COMMON_NOUNS = /^(université|école|institut|académie|établissement)(?=[\s-]|$)/iu

/**
 * « de » before the name of an institution: « de l'Université Gustave Eiffel » when it starts with a
 * common noun, « d'Aix-Marseille Université » before a vowel, « de Sorbonne Université » otherwise.
 */
const ofInstitution = (name: string): string => {
  if (COMMON_NOUNS.test(name)) return `de l'${name}`
  return /^[aeiouyhàâäéèêëîïôöûüÿ]/iu.test(name) ? `d'${name}` : `de ${name}`
}

/** What PLaTon is, in one sentence, for the institution when there is one. */
export const coverSentence = (institution: string | undefined): string =>
  `PLaTon est ${
    institution ? `la plateforme d'exercices ${ofInstitution(institution)}` : "une plateforme d'exercices"
  }. ` +
  'Les enseignants y écrivent des exercices auto-évalués et les proposent dans leurs cours\u00a0; les étudiants les font ' +
  'et reçoivent un retour immédiat.'

export const coverFooter = (institution: string | undefined): string =>
  institution ? `${institution}. Logiciel libre, cisstech.` : 'Logiciel libre, cisstech.'
