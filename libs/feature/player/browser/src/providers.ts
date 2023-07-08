import { Provider } from '@angular/core'
import { PlayerProvider } from './models/player-provider'
import { RemotePlayerService } from './providers/remote-player.provider'

export const PLAYER_PROVIDERS: Provider[] = [
  { provide: PlayerProvider, useClass: RemotePlayerService },
]
