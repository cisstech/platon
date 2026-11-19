import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundResponse } from '@platon/core/common'
import { Optional } from 'typescript-optional'
import { CasController } from './cas.controller'
import { CasEntity } from './entities/cas.entity'
import { CasService } from './cas.service'

describe('CasController', () => {
  let controller: CasController
  let service: jest.Mocked<CasService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasController],
      providers: [
        {
          provide: CasService,
          useValue: {
            searchCas: jest.fn(),
            findCasById: jest.fn(),
            findCasByName: jest.fn(),
            createCas: jest.fn(),
            updateCas: jest.fn(),
            deleteCas: jest.fn(),
            fromInput: jest.fn(),
            signIn: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(CasController)
    service = module.get(CasService)
  })

  describe('listCas', () => {
    it('devrait retourner uniquement les noms des CAS', async () => {
      service.searchCas.mockResolvedValue([[{ name: 'univ-a' } as CasEntity, { name: 'univ-b' } as CasEntity], 2])

      const result = await controller.listCas()

      expect(result.resources).toEqual(['univ-a', 'univ-b'])
      expect(result.total).toBe(2)
    })
  })

  describe('login', () => {
    const buildReq = () =>
      ({ get: jest.fn().mockReturnValue('app.test'), baseUrl: '/api/v1', path: '/cas/login/my-cas' } as never)

    it("devrait envoyer vers le CAS avec une adresse de service encodée, la même qu'à son retour", async () => {
      service.findCasByName.mockResolvedValue(Optional.of({ loginURL: 'https://cas.test/login' } as CasEntity))
      service.signIn.mockResolvedValue({ outcome: 'no-account' })

      const toCas = await controller.login('my-cas', { next: '/courses/1?tab=a&b=c' } as never, buildReq())
      const serviceUrl = new URL(toCas.url).searchParams.get('service') as string
      expect(toCas.url.startsWith('https://cas.test/login?service=https%3A%2F%2Fapp.test')).toBe(true)

      // The CAS sends the person back to the service address, with its ticket.
      const back = new URL(serviceUrl)
      back.searchParams.set('ticket', 'ST-1')
      await controller.login('my-cas', Object.fromEntries(back.searchParams) as never, buildReq())

      expect(service.signIn).toHaveBeenCalledWith('my-cas', 'ST-1', serviceUrl)
    })

    it('devrait ramener à la page de connexion quand le CAS est inconnu', async () => {
      service.findCasByName.mockResolvedValue(Optional.empty())

      const result = await controller.login('unknown-cas', { next: '/home' } as never, buildReq())

      expect(result).toEqual({ url: '/login?error=cas&next=%2Fhome', statusCode: 302 })
    })

    it('devrait passer les jetons à la page de connexion, sans next quand il manque', async () => {
      service.signIn.mockResolvedValue({ outcome: 'signed-in', token: { accessToken: 'a', refreshToken: 'r' } })

      expect((await controller.login('my-cas', { ticket: 'ST-1', next: '/home' } as never, buildReq())).url).toBe(
        '/login?access-token=a&refresh-token=r&next=%2Fhome'
      )
      expect((await controller.login('my-cas', { ticket: 'ST-1' } as never, buildReq())).url).toBe(
        '/login?access-token=a&refresh-token=r'
      )
    })

    it('devrait mener à /login/no-account quand aucun compte PLaTon ne correspond', async () => {
      service.signIn.mockResolvedValue({ outcome: 'no-account' })

      const result = await controller.login('my-cas', { ticket: 'ST-1' } as never, buildReq())

      expect(result).toEqual({ url: '/login/no-account', statusCode: 302 })
    })

    it("devrait ramener à la page de connexion avec l'échec, avec ou sans next", async () => {
      service.signIn.mockResolvedValue({ outcome: 'failed' })

      expect(await controller.login('my-cas', { ticket: 'ST-1', next: '/home' } as never, buildReq())).toEqual({
        url: '/login?error=cas&next=%2Fhome',
        statusCode: 302,
      })
      expect((await controller.login('my-cas', { ticket: 'ST-1' } as never, buildReq())).url).toBe('/login?error=cas')
    })
  })

  describe('searchCas / findCas / createCas / updateCas / deleteCas', () => {
    it('searchCas devrait retourner les CAS mappés avec le total', async () => {
      service.searchCas.mockResolvedValue([[{ id: 'cas-1' } as CasEntity], 1])

      const result = await controller.searchCas({})

      expect(result.total).toBe(1)
    })

    it("findCas devrait rejeter avec NotFoundResponse si le CAS n'existe pas", async () => {
      service.findCasById.mockResolvedValue(Optional.empty())

      await expect(controller.findCas('unknown')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('findCas devrait retourner le CAS mappé', async () => {
      service.findCasById.mockResolvedValue(Optional.of({ id: 'cas-1' } as CasEntity))

      const result = await controller.findCas('cas-1')

      expect(result.resource).toBeDefined()
    })

    it('createCas devrait construire le CAS via fromInput puis le créer', async () => {
      service.fromInput.mockResolvedValue({ name: 'my-cas' } as never)
      service.createCas.mockResolvedValue({ id: 'cas-1', name: 'my-cas' } as CasEntity)

      const result = await controller.createCas({ name: 'my-cas' } as never)

      expect(result.resource.name).toBe('my-cas')
    })

    it('updateCas devrait construire les changements via fromInput puis mettre à jour', async () => {
      service.fromInput.mockResolvedValue({ name: 'Updated' } as never)
      service.updateCas.mockResolvedValue({ id: 'cas-1', name: 'Updated' } as CasEntity)

      const result = await controller.updateCas('cas-1', { name: 'Updated' } as never)

      expect(service.updateCas).toHaveBeenCalledWith('cas-1', { name: 'Updated' })
      expect(result.resource.name).toBe('Updated')
    })

    it('deleteCas devrait déléguer la suppression au service', async () => {
      await controller.deleteCas('cas-1')

      expect(service.deleteCas).toHaveBeenCalledWith('cas-1')
    })
  })
})
