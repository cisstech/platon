import { Provider } from '@angular/core'
import { NgeUiIconConfig, NGE_UI_ICON_CONFIG } from '@cisstech/nge/ui/icon'

export const NgeIconProviders: Provider = [
  {
    provide: NGE_UI_ICON_CONFIG,
    useValue: {
      extraFileIcons: [
        { name: 'ple', fileExtensions: ['ple'] },
        { name: 'pla', fileExtensions: ['pla'] },
        { name: 'plf', fileExtensions: ['plf'] },
      ],
    } as NgeUiIconConfig,
  },
]
