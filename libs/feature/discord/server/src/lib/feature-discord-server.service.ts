import { Injectable } from '@nestjs/common'
import { DiscordModuleOption, DiscordOptionsFactory } from '@discord-nestjs/core'
import { GatewayIntentBits } from 'discord.js'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ProxyAgent } from 'undici'

const proxy = process.env['PROXY_URL'] as string
export let agent: ProxyAgent | null = null
export let httpsproxyagent: HttpsProxyAgent | null = null
if (proxy) {
  httpsproxyagent = new HttpsProxyAgent(proxy)
  agent = new ProxyAgent({ uri: proxy })
}

@Injectable()
export class FeatureDiscordServerService implements DiscordOptionsFactory {
  createDiscordOptions(): DiscordModuleOption {
    return {
      token: process.env['DISCORD_BOT_TOKEN'] as string,
      discordClientOptions: {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
        rest: { agent },
        ws: { proxyAgentOptions: httpsproxyagent },
      },
    }
  }
}
