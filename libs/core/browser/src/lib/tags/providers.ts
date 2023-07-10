import { Provider } from '@angular/core'
import { TagProvider } from './models/tag-provider'
import { RemoteTagProvider } from './providers/remote-tag.provider'

export const TAG_PROVIDERS: Provider[] = [{ provide: TagProvider, useClass: RemoteTagProvider }]
