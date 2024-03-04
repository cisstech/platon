import { Test } from '@nestjs/testing'
import { FeatureDiscordServerService } from './feature-discord-server.service'

describe('FeatureDiscordServerService', () => {
  let service: FeatureDiscordServerService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FeatureDiscordServerService],
    }).compile()

    service = module.get(FeatureDiscordServerService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
