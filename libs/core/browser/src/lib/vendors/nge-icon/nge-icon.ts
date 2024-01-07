import { Provider } from '@angular/core'
import { NGE_UI_ICON_CONFIG, NgeUiIconConfig } from '@cisstech/nge/ui/icon'

export const NgeIconProviders: Provider = [
  {
    provide: NGE_UI_ICON_CONFIG,
    useValue: {
      extraFileIcons: [{ name: 'platon', fileExtensions: ['ple', 'plf', 'plc'], fileNames: ['config.json'] }],
    } as NgeUiIconConfig,
  },
]
