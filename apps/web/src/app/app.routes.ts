import { Route } from '@angular/router'
import { withAuthGuard } from '@platon/core/browser'
import { UserRoles } from '@platon/core/common'
import { UiError403Component, UiError404Component, UiError500Component } from '@platon/shared/ui'

export const appRoutes: Route[] = [
  { path: '403', component: UiError403Component },
  { path: '404', component: UiError404Component },
  { path: '500', component: UiError500Component },

  {
    path: 'login',
    loadChildren: () =>
      import(
        /* webpackChunkName: "login" */
        './pages/login/login.routes'
      ),
  },
  {
    path: 'docs',
    loadChildren: () =>
      import(
        /* webpackChunkName: "docs" */
        './pages/docs/docs.routes'
      ),
  },
  {
    path: 'player',
    loadChildren: () =>
      import(
        /* webpackChunkName: "player" */
        './pages/player/player.routes'
      ),
  },
  withAuthGuard(
    {
      path: 'editor',
      loadChildren: () =>
        import(
          /* webpackChunkName: "editor" */
          './pages/editor/editor.routes'
        ),
    },
    [UserRoles.teacher, UserRoles.admin]
  ),
  withAuthGuard({
    path: '',
    loadChildren: () => import('./pages/dashboard/dashboard.routes'),
  }),
]
