import { Provider } from '@angular/core'
import { AiProvider } from './models/ai-provider'
import { RemoteAiProvider } from './providers/remote-ai.provider'

export const CAS_PROVIDERS: Provider[] = [{ provide: AiProvider, useClass: RemoteAiProvider }]
