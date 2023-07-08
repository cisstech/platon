import { Provider } from '@angular/core'
import { LTIProvider } from './models/lms-provider'
import { RemoteLTIProvider } from './providers/remote-lti.provider'

export const LTI_PROVIDERS: Provider[] = [{ provide: LTIProvider, useClass: RemoteLTIProvider }]
