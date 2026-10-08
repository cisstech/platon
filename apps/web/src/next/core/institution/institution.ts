import { DOCUMENT } from '@angular/common'
import { InjectionToken, inject } from '@angular/core'

/** The name of the institution, from `<meta name="platon-institution">`; none when it is absent or empty. */
export const readInstitution = (document: Document): string | undefined =>
  document.querySelector<HTMLMetaElement>('meta[name="platon-institution"]')?.content.trim() || undefined

export const INSTITUTION_NAME = new InjectionToken<string | undefined>('INSTITUTION_NAME', {
  factory: () => readInstitution(inject(DOCUMENT)),
})
