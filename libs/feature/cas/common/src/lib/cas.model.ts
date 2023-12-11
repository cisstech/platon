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
