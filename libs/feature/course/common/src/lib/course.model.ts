import { OrderingDirections } from '@platon/core/common'

export interface Course {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt?: Date
  readonly name: string
  readonly desc?: string
  readonly ownerId: string
}

export interface CreateCourse {
  readonly name: string
  readonly code?: string
  readonly desc?: string
}

export interface UpdateCourse {
  readonly name?: string
  readonly desc?: string
}

export enum CourseOrderings {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface CourseFilters {
  readonly search?: string
  readonly members?: string[]
  readonly period?: number
  readonly offset?: number
  readonly limit?: number
  readonly order?: CourseOrderings
  readonly direction?: OrderingDirections
}
