import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Count, Icon } from '@platon/design-system'
import { TodoView } from '../../teacher/course-teacher.vm'

/** « À faire » of the teacher of a course: only actions, each opening where to act, in the tone of its state. */
@Component({
  selector: 'app-course-todo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Count, Icon, RouterLink],
  templateUrl: './course-todo.html',
  styleUrl: './course-todo.scss',
})
export class CourseTodo {
  readonly items = input.required<TodoView[]>()
}
