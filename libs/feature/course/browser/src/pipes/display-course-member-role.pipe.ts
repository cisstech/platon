import { Pipe, PipeTransform } from '@angular/core'
import { CourseMemberRoles } from '@platon/feature/course/common'

@Pipe({
  name: 'displayCourseMemberRole',
})
export class DisplayCourseMemberRolePipe implements PipeTransform {
  transform(courseMemberRole?: CourseMemberRoles | 'student' | 'teacher'): string {
    switch (courseMemberRole) {
      case 'student':
        return 'Étudiant'
      case 'teacher':
        return 'Enseignant'
      default:
        return 'Inconnu'
    }
  }
}
