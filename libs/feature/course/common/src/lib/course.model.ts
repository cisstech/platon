import { ExpandableModel, OrderingDirections } from '@platon/core/common'
import { CoursePermissions } from './permissions.model'
import { CourseStatistic } from './statistic.model'

export type CourseExpandableFields = 'permissions' | 'statistic'

export enum CourseOrderings {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface Course {
  readonly id: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly name: string
  readonly desc?: string
  readonly ownerId: string

  readonly statistic?: CourseStatistic
  readonly permissions?: CoursePermissions
}

export interface FindCourse extends ExpandableModel<CourseExpandableFields> {
  readonly id: string
}

export interface CreateCourse extends ExpandableModel<CourseExpandableFields> {
  readonly name: string
  readonly code?: string
  readonly desc?: string
}

export interface UpdateCourse extends ExpandableModel<CourseExpandableFields> {
  readonly name?: string
  readonly desc?: string
}

export interface CourseFilters extends ExpandableModel<CourseExpandableFields> {
  readonly search?: string
  readonly members?: string[]
  readonly period?: number
  readonly offset?: number
  readonly limit?: number
  readonly order?: CourseOrderings
  readonly direction?: OrderingDirections
}
