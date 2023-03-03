import { Pipe, PipeTransform } from '@angular/core';
import { CourseOrderings } from '@platon/feature/course/common';

export const COURSE_ORDERING_NAMES: Record<CourseOrderings, string> = {
  NAME: 'Nom',
  CREATED_AT: 'Date de création',
  UPDATED_AT: "Date de mise à jour",
}

@Pipe({
  name: 'courseOrdering'
})
export class CourseOrderingPipe implements PipeTransform {
  transform(status: CourseOrderings | string): string {
    return COURSE_ORDERING_NAMES[status as CourseOrderings];
  }
}
