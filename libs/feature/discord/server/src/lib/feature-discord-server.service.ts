import { Injectable } from '@nestjs/common';
import {
  DiscordModuleOption,
  DiscordOptionsFactory,
} from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {ProxyAgent} from 'undici';


const proxy = 'http://proxy.univ-eiffel.fr:3128'; // Replace THE_PROXY_URL with your actual proxy URL
const httpsproxyagent = new HttpsProxyAgent(proxy);
const agent = new ProxyAgent({ uri: proxy });

@Injectable()
export class FeatureDiscordServerService implements DiscordOptionsFactory {
  createDiscordOptions(): DiscordModuleOption {
    return {
      token: 'YOUR TOKEN HERE',
      discordClientOptions: {
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
        rest: { agent },
        ws: { agent: httpsproxyagent }
      },
    };
  }
}
