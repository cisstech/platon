import { Provider } from '@angular/core'
import { PeerProvider } from './models/peer-provider'
import { RemotePeerProvider } from './providers/remote-peer.provider'

export const PEER_PROVIDERS: Provider[] = [{ provide: PeerProvider, useClass: RemotePeerProvider }]
