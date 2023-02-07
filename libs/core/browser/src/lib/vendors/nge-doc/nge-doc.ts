import { Provider } from '@angular/core';
import { NGE_DOC_RENDERERS } from '@cisstech/nge/doc';

export const NgeDocProviders: Provider[] = [
  {
    provide: NGE_DOC_RENDERERS,
    useValue: {
      markdown: {
        component: () => import('@cisstech/nge/markdown').then((m) => m.NgeMarkdownComponent),
      },
    },
  }
];
