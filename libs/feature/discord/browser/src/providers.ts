import { Provider } from '@angular/core'
import { DiscordProvider } from './models/discord-provider'
import { RemoteDiscordService } from './providers/remote-discord.provider'

export const DISCORD_PROVIDERS: Provider[] = [{ provide: DiscordProvider, useClass: RemoteDiscordService }]
