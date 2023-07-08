import { Routes } from '@angular/router'
import { CourseActivityPage } from './activity.page'

export default [
  {
    path: ':courseId/:activityId',
    component: CourseActivityPage,
  },
] as Routes
