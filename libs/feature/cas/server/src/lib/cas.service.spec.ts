import { Test } from '@nestjs/testing'
import { FeatureCasServerService } from './feature/cas/server.service'

describe('FeatureCasServerService', () => {
  let service: FeatureCasServerService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FeatureCasServerService],
    }).compile()

    service = module.get(FeatureCasServerService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
