import { Route } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { UiError403Component, UiError404Component, UiError500Component } from '@platon/shared/ui';

export const appRoutes: Route[] = [
  withAuthGuard({ path: '', loadChildren: () => import('./pages/dashboard/dashboard.routes')}),
  {
    path: 'login',
    loadComponent: () => import(
      /* webpackChunkName: "login" */
      './pages/login/login.component'
    )
  },
  { path: '403', component: UiError403Component },
  { path: '404', component: UiError404Component },
  { path: '500', component: UiError500Component },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
