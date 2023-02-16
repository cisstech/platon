import { provideHttpClient, withRequestsMadeViaParent } from '@angular/common/http';
import { Routes } from '@angular/router';
import { EditorComponent } from './editor.component';

export default [
  {
    path: ':id',
    component: EditorComponent,
    providers: [
      provideHttpClient(
        withRequestsMadeViaParent()
      )
    ]
  },
] as Routes;
