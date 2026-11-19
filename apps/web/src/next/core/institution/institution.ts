import { DOCUMENT } from '@angular/common'
import { InjectionToken, inject } from '@angular/core'

/** The content of `<meta name="…">`; none when it is absent or empty. */
const readMeta = (document: Document, name: string): string | undefined =>
  document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content.trim() || undefined

/** The name of the institution, from `<meta name="platon-institution">`; none when it is absent or empty. */
export const readInstitution = (document: Document): string | undefined => readMeta(document, 'platon-institution')

export const INSTITUTION_NAME = new InjectionToken<string | undefined>('INSTITUTION_NAME', {
  factory: () => readInstitution(inject(DOCUMENT)),
})

/** The address of the presentation of PLaTon, from `<meta name="platon-presentation">`; none without it. */
export const readPresentation = (document: Document): string | undefined => readMeta(document, 'platon-presentation')

export const PRESENTATION_URL = new InjectionToken<string | undefined>('PRESENTATION_URL', {
  factory: () => readPresentation(inject(DOCUMENT)),
})
