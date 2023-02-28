import { Route } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { UserRoles } from '@platon/core/common';
import { UiError403Component, UiError404Component, UiError500Component } from '@platon/shared/ui';

export const appRoutes: Route[] = [
  withAuthGuard({ path: '', loadChildren: () => import('./pages/dashboard/dashboard.routes') }),
  {
    path: 'login',
    loadComponent: () => import(
      /* webpackChunkName: "login" */
      './pages/login/login.component'
    )
  },
  {
    path: 'docs',
    loadChildren: () => import(
      /* webpackChunkName: "docs" */
      './pages/docs/docs.routes'
    )
  },
  withAuthGuard({
    path: 'editor',
    loadChildren: () => import(
      /* webpackChunkName: "editor" */
      './pages/editor/editor.routes'
    )
  }, [UserRoles.teacher, UserRoles.admin]),
  {
    path: 'player',
    loadChildren: () => import(
      /* webpackChunkName: "player" */
      './pages/player/player.routes'
    )
  },
  { path: '403', component: UiError403Component },
  { path: '404', component: UiError404Component },
  { path: '500', component: UiError500Component },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
