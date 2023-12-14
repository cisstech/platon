import { CourseFilters, CourseOrderings } from '@platon/feature/course/common'
import { FilterIndicator } from '@platon/shared/ui'
import { COURSE_ORDERING_NAMES } from '../../pipes'

export const CourseOrderingFilterIndicator = (ordering: CourseOrderings): FilterIndicator<CourseFilters> => {
  return {
    match: (filters) => filters.order === ordering,
    describe: () => 'Trier par ' + COURSE_ORDERING_NAMES[ordering],
    remove: (filters: CourseFilters) => ({
      ...filters,
      order: undefined,
    }),
  }
}
