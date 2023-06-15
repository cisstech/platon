import { Routes } from '@angular/router';
import { CourseDemoPage } from './demo.page';

export default [
  {
    path: ':id',
    component: CourseDemoPage,
  },
] as Routes;
