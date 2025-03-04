import { Routes } from '@angular/router'
import { WcPlaygroundPage } from './wc-playground/wc-playground.page'

export default [
  {
    path: 'components/:selector',
    component: WcPlaygroundPage,
  },
] as Routes
