import { Test } from '@nestjs/testing'
import { FeatureDiscordServerService, agent, httpsproxyagent } from './feature-discord-server.service'
import { GatewayIntentBits } from 'discord.js'

describe('FeatureDiscordServerService', () => {
  let service: FeatureDiscordServerService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FeatureDiscordServerService],
    }).compile()

    service = module.get(FeatureDiscordServerService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should create Discord options', () => {
    const options = service.createDiscordOptions()
    expect(options).toBeDefined()
    expect(options.token).toEqual(process.env['DISCORD_BOT_TOKEN'])
    expect(options.discordClientOptions).toBeDefined()
    expect(options.discordClientOptions.intents).toEqual([
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ])
    expect(options.discordClientOptions.rest).toBeDefined()
    expect(options.discordClientOptions?.rest?.agent).toEqual(agent)
    expect(options.discordClientOptions.ws).toBeDefined()
    expect(options.discordClientOptions.ws?.proxyAgentOptions).toEqual(httpsproxyagent)
  })

  it('should not define agent and httpsproxyagent if process.env[PROXY_URL] is not defined', () => {
    delete process.env['PROXY_URL']
    expect(agent).toBeNull()
    expect(httpsproxyagent).toBeNull()
  })

  it('should define agent and httpsproxyagent if process.env[PROXY_URL] is defined', () => {
    process.env['PROXY_URL'] = 'https://example.com'
    expect(agent).toBeDefined()
    expect(httpsproxyagent).toBeDefined()
  })
})
