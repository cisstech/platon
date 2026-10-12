import { OrderingDirections } from '@platon/core/common'
import { Lms } from '@platon/feature/lti/common'

export enum CasVersions {
  V1 = '1.0',
  V2 = '2.0',
  V3 = '3.0',
  SAML1_1 = 'saml1.1',
}

export enum CasOrdering {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

/** The `error` the API puts on `/login` when the CAS refused the sign-in or could not be reached. */
export const CAS_SIGN_IN_FAILED = 'cas'

/** Where the browser starts a sign-in through the CAS `name`; the API brings the person back to `next`. */
export const casSignInUrl = (name: string, next?: string | null): string =>
  `/api/v1/cas/login/${encodeURIComponent(name)}${next ? `?next=${encodeURIComponent(next)}` : ''}`

export interface Cas {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly name: string
  readonly loginURL: string
  readonly serviceValidateURL: string
  readonly lmses: Lms[]
  readonly version: CasVersions
}

export interface CreateCas {
  readonly name: string
  readonly loginURL: string
  readonly serviceValidateURL: string
  readonly lmses: string[]
  readonly version: CasVersions
}

export interface UpdateCas {
  readonly name?: string
  readonly loginURL?: string
  readonly serviceValidateURL?: string
  readonly lmses?: string[]
  readonly version?: string
}

export interface CasFilters {
  readonly search?: string
  readonly offset?: number
  readonly limit?: number
  readonly order?: CasOrdering | keyof typeof CasOrdering
  readonly direction?: OrderingDirections
}
