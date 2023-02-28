import { Routes } from '@angular/router';
import { EditorComponent } from './editor.component';

export default [
  {
    path: ':id',
    component: EditorComponent
  },
] as Routes;
