import { Routes } from '@angular/router'
import { withAuthGuard } from '@platon/core/browser'
import { AccountPage } from './account.page'

export default [
  withAuthGuard({
    path: '',
    component: AccountPage,
    children: [
      {
        path: 'about-me',
        loadChildren: () =>
          import(
            /* webpackChunkName: "account-about-me" */
            './about-me/about-me.routes'
          ),
      },
      {
        path: 'security',
        loadChildren: () =>
          import(
            /* webpackChunkName: "account-security" */
            './security/security.routes'
          ),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import(
            /* webpackChunkName: "account-notification-prefs" */
            './notification-prefs/notification-prefs.routes'
          ),
      },

      { path: '**', pathMatch: 'full', redirectTo: 'about-me' },
    ],
  }),
] as Routes
