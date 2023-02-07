import { NgeMonacoModule, NGE_MONACO_THEMES } from '@cisstech/nge/monaco';

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
  })
];
