import { Route } from '@angular/router'
import { alwaysLightTheme, withAuthGuard } from '@platon/core/browser'
import { UserRoles } from '@platon/core/common'
import { UiError403Component, UiError404Component, UiError500Component } from '@platon/shared/ui'

export const appRoutes: Route[] = [
  { path: '403', component: UiError403Component },
  { path: '404', component: UiError404Component },
  { path: '500', component: UiError500Component },

  {
    path: 'login',
    title: 'PLaTon - Connexion',
    data: {
      ...alwaysLightTheme,
    },
    loadChildren: () =>
      import(
        /* webpackChunkName: "login" */
        './pages/login/login.routes'
      ),
  },
  {
    path: 'playground',
    title: 'PLaTon - Playground',
    loadChildren: () =>
      import(
        /* webpackChunkName: "playground" */
        './pages/playground/playground.routes'
      ),
  },

  {
    path: 'player',
    title: 'PLaTon - Player',
    data: {
      ...alwaysLightTheme,
    },
    loadChildren: () =>
      import(
        /* webpackChunkName: "player" */
        './pages/player/player.routes'
      ),
  },
  {
    path: 'demo',
    loadChildren: () =>
      import(
        /* webpackChunkName: "course-demo" */
        './pages/demo/demo.routes'
      ),
  },
  withAuthGuard(
    {
      path: 'editor',
      data: {
        ...alwaysLightTheme,
      },
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
