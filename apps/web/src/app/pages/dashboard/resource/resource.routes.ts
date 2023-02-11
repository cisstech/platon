import { Routes } from '@angular/router';
import { ResourceComponent } from './resource.component';

export default [
  {
    path: ':id',
    component: ResourceComponent
  },
] as Routes;
