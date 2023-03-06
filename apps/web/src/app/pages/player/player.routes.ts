import { Routes } from '@angular/router';

export default [
  {
    path: 'preview',
    loadChildren: () => import(
      /* webpackChunkName: "player-preview" */
      './preview/preview.routes'
    )
  },
  {
    path: 'activity',
    loadChildren: () => import(
      /* webpackChunkName: "player-activity" */
      './activity/activity.routes'
    )
  },
] as Routes;
