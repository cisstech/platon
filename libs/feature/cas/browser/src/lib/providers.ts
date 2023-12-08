import { Provider } from '@angular/core'
import { CasProvider } from './models/cas-provider'
import { RemoteCasProvider } from './providers/remote-cas.provider'

export const CAS_PROVIDERS: Provider[] = [{ provide: CasProvider, useClass: RemoteCasProvider }]
