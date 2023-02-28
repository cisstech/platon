import { Routes } from '@angular/router';

export default [
  {
    path: 'preview',
    loadChildren: () => import(
      /* webpackChunkName: "player-preview" */
      './preview/preview.routes'
    )
  },
] as Routes;
