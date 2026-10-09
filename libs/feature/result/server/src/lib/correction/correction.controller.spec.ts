import { BadRequestException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ForbiddenResponse, UserRoles } from '@platon/core/common'
import { IRequest } from '@platon/core/server'
import { ActivityCorrection, ActivityCorrectionSummary, CorrectionStatus } from '@platon/feature/result/common'
import { CorrectionLabelService } from '../label/correction-label/correction-label.service'
import { CorrectionController } from './correction.controller'
import { CorrectionEntity } from './correction.entity'
import { CorrectionService } from './correction.service'

describe('CorrectionController', () => {
  let controller: CorrectionController
  let service: jest.Mocked<Pick<CorrectionService, 'list' | 'listSummary' | 'upsert'>>
  let correctionLabelService: jest.Mocked<Pick<CorrectionLabelService, 'labelize'>>

  beforeEach(async () => {
    service = { list: jest.fn(), listSummary: jest.fn(), upsert: jest.fn() }
    correctionLabelService = { labelize: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CorrectionController,
        { provide: CorrectionService, useValue: service },
        { provide: CorrectionLabelService, useValue: correctionLabelService },
      ],
    }).compile()

    controller = module.get(CorrectionController)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('list', () => {
    it('devrait rejeter un statut invalide', async () => {
      const req = { user: { id: 'u1' } } as IRequest

      await expect(controller.list(req, 'invalid' as never)).rejects.toBeInstanceOf(BadRequestException)
    })

    it('devrait retourner la liste mappée', async () => {
      service.list.mockResolvedValue([{ activityId: 'a1', exercises: [] } as unknown as ActivityCorrection])
      const req = { user: { id: 'u1' } } as IRequest

      const result = await controller.list(req, CorrectionStatus.pending)

      expect(service.list).toHaveBeenCalledWith('u1', undefined, false, CorrectionStatus.pending)
      expect(result.total).toBe(1)
    })
  })

  describe('listSummary', () => {
    it('devrait rejeter un statut invalide', async () => {
      const req = { user: { id: 'u1' } } as IRequest

      await expect(controller.listSummary(req, 'invalid' as never)).rejects.toBeInstanceOf(BadRequestException)
    })

    it('devrait retourner le résumé mappé', async () => {
      service.listSummary.mockResolvedValue([{ activityId: 'a1', pendingCopies: 2 } as ActivityCorrectionSummary])
      const req = { user: { id: 'u1' } } as IRequest

      const result = await controller.listSummary(req)

      expect(result.total).toBe(1)
      expect(result.resources[0].pendingCopies).toBe(2)
    })
  })

  describe('find', () => {
    it('devrait lever une ForbiddenResponse en mode viewer pour un étudiant', async () => {
      const req = { user: { id: 'u1', role: UserRoles.student } } as IRequest

      await expect(controller.find(req, 'activity-1', 'true')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait autoriser le mode viewer pour un enseignant', async () => {
      service.list.mockResolvedValue([])
      const req = { user: { id: 'u1', role: UserRoles.teacher } } as IRequest

      await controller.find(req, 'activity-1', 'true')

      expect(service.list).toHaveBeenCalledWith('u1', 'activity-1', true)
    })

    it('ne devrait pas activer le mode viewer sans le paramètre', async () => {
      service.list.mockResolvedValue([])
      const req = { user: { id: 'u1', role: UserRoles.student } } as IRequest

      await controller.find(req, 'activity-1')

      expect(service.list).toHaveBeenCalledWith('u1', 'activity-1', false)
    })
  })

  describe('upsert', () => {
    it('devrait créer la correction avec authorId injecté', async () => {
      service.upsert.mockResolvedValue({ id: 'correction-1' } as CorrectionEntity)
      const req = { user: { id: 'teacher-1' } } as IRequest

      await controller.upsert(req, 'session-1', { grade: 8 } as never)

      expect(service.upsert).toHaveBeenCalledWith(
        'session-1',
        expect.objectContaining({ grade: 8, authorId: 'teacher-1' })
      )
    })

    it('devrait labelliser chaque label fourni', async () => {
      service.upsert.mockResolvedValue({ id: 'correction-1' } as CorrectionEntity)
      const req = { user: { id: 'teacher-1' } } as IRequest

      await controller.upsert(req, 'session-1', {
        grade: 8,
        labels: [{ answerId: 'answer-1', labelId: 'label-1' }],
      } as never)

      expect(correctionLabelService.labelize).toHaveBeenCalledWith('session-1', 'answer-1', 'label-1', 'correction-1')
    })

    it('ne devrait pas labelliser sans labels fournis', async () => {
      service.upsert.mockResolvedValue({ id: 'correction-1' } as CorrectionEntity)
      const req = { user: { id: 'teacher-1' } } as IRequest

      await controller.upsert(req, 'session-1', { grade: 8 } as never)

      expect(correctionLabelService.labelize).not.toHaveBeenCalled()
    })
  })
})
