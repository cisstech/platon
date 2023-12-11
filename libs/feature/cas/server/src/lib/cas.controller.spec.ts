import { Test } from '@nestjs/testing'
import { CasController } from './cas.controller'
import { CasService } from './cas.service'

describe('FeatureCasServerController', () => {
  let controller: CasController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CasService],
      controllers: [CasController],
    }).compile()

    controller = module.get(CasController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
