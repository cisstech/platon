import { Routes } from '@angular/router'
import { PlayerPreviewPage } from './preview.page'

export default [
  {
    path: ':id',
    component: PlayerPreviewPage,
  },
] as Routes
