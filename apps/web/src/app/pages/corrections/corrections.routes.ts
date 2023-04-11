import { Routes } from '@angular/router';
import { CorrectionsPage } from './corrections.page';

export default [
  {
    path: '',
    component: CorrectionsPage,
    children: [
      {
        path: 'pendings',
        loadChildren: () => import(
          /* webpackChunkName: "corrections-pendings" */
          './pendings/pendings.routes'
        )
      },
      {
        path: 'availables',
        loadChildren: () => import(
          /* webpackChunkName: "corrections-availables" */
          './availables/availables.routes'
        )

      },
      { path: '**', pathMatch: 'full', redirectTo: 'pendings' }
    ],
  },
] as Routes;
