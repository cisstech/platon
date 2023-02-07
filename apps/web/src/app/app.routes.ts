import { Route } from '@angular/router';
import { withAuthGuard } from '@platon/core/browser';
import { Error403Component, Error404Component, Error500Component } from '@platon/shared/ui';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () => import(
      /* webpackChunkName: "login" */
      './pages/login/login.component'
    )
  },
  withAuthGuard({
    path: 'dashboard',
    loadComponent: () => import(
      /* webpackChunkName: "dashboard" */
      './pages/dashboard/dashboard.component'
    )
  }),
  { path: '403', component: Error403Component },
  { path: '404', component: Error404Component },
  { path: '500', component: Error500Component },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' }
];
