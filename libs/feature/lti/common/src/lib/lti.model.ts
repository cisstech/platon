import { OrderingDirections } from '@platon/core/common'

export enum LmsOrdering {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface Lms {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly name: string
  readonly url: string
  readonly outcomeUrl: string
  readonly consumerKey: string
  readonly consumerSecret: string
}

export interface CreateLms {
  readonly name: string
  readonly url: string
  readonly outcomeUrl: string
  readonly consumerKey: string
  readonly consumerSecret: string
}

export interface UpdateLms {
  readonly name?: string
  readonly url?: string
  readonly outcomeUrl?: string
  readonly consumerKey?: string
  readonly consumerSecret?: string
}

export interface LmsFilters {
  readonly search?: string
  readonly offset?: number
  readonly limit?: number
  readonly order?: LmsOrdering | keyof typeof LmsOrdering
  readonly direction?: OrderingDirections
}
