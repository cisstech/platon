import { Provider } from '@angular/core';
import { NgeMonacoModule, NGE_MONACO_CONTRIBUTION, NGE_MONACO_THEMES } from '@cisstech/nge/monaco';
import { PlLanguageContribution } from './contributions/pl-lang.contribution';

export const NgeMonacoImports = [
  NgeMonacoModule.forRoot({
    locale: 'fr',
    assets: 'assets/vendors/nge/monaco/',
    theming: {
      themes: NGE_MONACO_THEMES.map(theme => 'assets/vendors/nge/monaco/themes/' + theme),
      default: 'github',
    },
    options: {
      automaticLayout: true
    }
  }),
];

export const NgeMonacoProviders: Provider = [
  {
    provide: NGE_MONACO_CONTRIBUTION,
    multi: true,
    useClass: PlLanguageContribution,
  },
]
