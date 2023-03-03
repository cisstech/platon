import { Routes } from '@angular/router';
import { CoursesComponent } from './courses.component';

export default [
  {
    path: '',
    component: CoursesComponent
  },
  {
    path: 'create',
    loadChildren: () => import(
      /* webpackChunkName: "course-create" */
      './create/create.routes'
    )
  },
  {
    path: ':id',
    loadChildren: () => import(
      /* webpackChunkName: "course-detail" */
      './course/course.routes'
    )
  }
] as Routes;
