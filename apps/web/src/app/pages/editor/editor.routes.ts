import { Routes } from '@angular/router'
import { EditorPage } from './editor.page'

export default [
  {
    path: ':id',
    component: EditorPage,
  },
] as Routes
