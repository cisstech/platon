import { CourseFilters, CourseOrderings } from '@platon/feature/course/common'
import { FilterIndicator } from '@platon/shared/ui'
import { COURSE_ORDERING_NAMES } from '../../../pipes'

export const CourseOrderingFilterMatcher = (ordering: CourseOrderings) => {
  return (filters: CourseFilters) =>
    filters.order === ordering
      ? ({
          label: 'Trier par ' + COURSE_ORDERING_NAMES[ordering],
          remove: (filters: CourseFilters) => ({
            ...filters,
            order: undefined,
          }),
        } as FilterIndicator<CourseFilters>)
      : undefined
}
