import { Routes } from '@angular/router'
import { LoginPage } from './login.page'

export default [
  {
    path: '',
    component: LoginPage,
  },
  {
    path: 'no-account',
    loadChildren: () =>
      import(
        /* webpackChunkName: "no-account" */
        './no-account/no-account.routes'
      ),
  },
] as Routes
