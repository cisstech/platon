import { Routes } from '@angular/router'
import { ExercisePlaygroundPage } from './exercise-playground/exercise-playground.page'
import { WcPlaygroundPage } from './wc-playground/wc-playground.page'

export default [
  {
    path: 'components/:selector',
    component: WcPlaygroundPage,
  },
  {
    path: 'exercises/:component/:file',
    component: ExercisePlaygroundPage,
  },
] as Routes
