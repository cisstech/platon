import { EnvironmentProviders, LOCALE_ID, Provider } from '@angular/core';
/** config angular i18n **/
import { registerLocaleData } from '@angular/common';
import frLocale from '@angular/common/locales/fr';
registerLocaleData(frLocale);

/** config ng-zorro-antd i18n **/
import { fr as frDateLocale } from 'date-fns/locale';
import { fr_FR, NZ_DATE_LOCALE, NZ_I18N } from 'ng-zorro-antd/i18n';


export const NgZorroProviders: (Provider | EnvironmentProviders)[] = [
  { provide: LOCALE_ID, useValue: 'fr-FR' },
  { provide: NZ_DATE_LOCALE, useValue: frDateLocale },
  {
    provide: NZ_I18N,
    useFactory: (localId: string) => {
      switch (localId) {
        /** keep the same with angular.json/i18n/locales configuration **/
        case 'fr':
          return fr_FR;
        default:
          return fr_FR;
      }
    },
    deps: [LOCALE_ID],
  },
];
