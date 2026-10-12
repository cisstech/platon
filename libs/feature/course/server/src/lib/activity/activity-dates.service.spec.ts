import { Test, TestingModule } from '@nestjs/testing'
import { CLS_REQ } from 'nestjs-cls'
import { makeUser } from '@platon/core/testing/common'
import { RestrictionList, RestrictionSubject } from '@platon/feature/course/common'
import { ActivityDatesService } from './activity-dates.service'
import { CourseMemberService } from '../course-member/course-member.service'
import { ActivityEntity } from './activity.entity'

const makeActivity = (overrides: Partial<ActivityEntity> = {}): ActivityEntity =>
  ({
    id: 'activity-1',
    courseId: 'course-1',
    ignoreRestrictions: false,
    restrictions: null,
    openAt: new Date('2026-01-01T00:00:00.000Z'),
    closeAt: new Date('2026-12-31T23:59:59.999Z'),
    ...overrides,
  } as unknown as ActivityEntity)

const subject = (memberIds: string[] = [], groupIds: string[] = []): RestrictionSubject => ({
  userId: 'user-1',
  memberIds: new Set(memberIds),
  groupIds: new Set(groupIds),
})

const period = (...restrictions: RestrictionList['restriction']): RestrictionList => ({
  restriction: restrictions,
})

const START = new Date('2026-01-23T08:00:00.000Z')
const END = new Date('2026-06-23T18:00:00.000Z')

// --- Tests ---

describe('ActivityDatesService', () => {
  let service: ActivityDatesService
  let memberService: jest.Mocked<Pick<CourseMemberService, 'restrictionSubject'>>
  const user = makeUser()

  beforeEach(async () => {
    memberService = { restrictionSubject: jest.fn().mockResolvedValue(subject()) }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityDatesService,
        { provide: CLS_REQ, useValue: { user } },
        { provide: CourseMemberService, useValue: memberService },
      ],
    }).compile()

    service = module.get(ActivityDatesService)
  })

  describe('reopenOrCloseAllRestrictions()', () => {
    it('ne fait rien si restrictions est null', async () => {
      const activity = makeActivity({ restrictions: null })
      await service.reopenOrCloseAllRestrictions(activity, false)
      expect(activity.restrictions).toBeNull()
    })

    it('ne fait rien si restrictions est un tableau vide', async () => {
      const activity = makeActivity({ restrictions: [] })
      await service.reopenOrCloseAllRestrictions(activity, false)
      expect(activity.restrictions).toHaveLength(0)
    })

    describe('fermeture (isOpen=false)', () => {
      it('définit end à maintenant pour chaque DateRange', async () => {
        const before = new Date()
        const config = { start: new Date('2026-01-01T00:00:00.000Z'), end: undefined }
        const activity = makeActivity({
          restrictions: [period({ type: 'DateRange', config })],
        })

        await service.reopenOrCloseAllRestrictions(activity, false)

        expect(config.end).toBeInstanceOf(Date)
        expect((config.end as unknown as Date).getTime()).toBeGreaterThanOrEqual(before.getTime())
      })

      it('conserve start si start est dans le passé', async () => {
        const pastStart = new Date('2025-01-01T00:00:00.000Z')
        const config = { start: pastStart, end: undefined }
        const activity = makeActivity({
          restrictions: [period({ type: 'DateRange', config })],
        })

        await service.reopenOrCloseAllRestrictions(activity, false)

        expect(config.start).toEqual(pastStart)
      })

      it('efface start si start est dans le futur', async () => {
        const futureStart = new Date('2099-01-01T00:00:00.000Z')
        const config = { start: futureStart, end: undefined }
        const activity = makeActivity({
          restrictions: [period({ type: 'DateRange', config })],
        })

        await service.reopenOrCloseAllRestrictions(activity, false)

        expect(config.start).toBeUndefined()
      })

      it('ne modifie pas les restrictions non-DateRange', async () => {
        const membersConfig = { members: ['m1'] }
        const activity = makeActivity({
          restrictions: [period({ type: 'Members', config: membersConfig })],
        })

        await service.reopenOrCloseAllRestrictions(activity, false)

        expect(membersConfig).toEqual({ members: ['m1'] })
      })
    })

    describe('ouverture (isOpen=true)', () => {
      it('efface end pour chaque DateRange', async () => {
        const config = { start: START, end: END }
        const activity = makeActivity({
          restrictions: [period({ type: 'DateRange', config }, { type: 'Others', config: { enabled: true } })],
        })

        await service.reopenOrCloseAllRestrictions(activity, true)

        expect(config.end).toBeUndefined()
      })

      it('ne rajoute pas de période Others si une existe déjà', async () => {
        const activity = makeActivity({
          restrictions: [period({ type: 'Others', config: { enabled: true } })],
        })

        await service.reopenOrCloseAllRestrictions(activity, true)

        expect(activity.restrictions).toHaveLength(1)
      })

      it("ajoute une période Others par défaut si aucune période n'en a", async () => {
        const activity = makeActivity({
          restrictions: [period({ type: 'Members', config: { members: ['m1'] } })],
        })

        await service.reopenOrCloseAllRestrictions(activity, true)

        expect(activity.restrictions).toHaveLength(2)
        const addedPeriod = activity.restrictions![1]
        expect(addedPeriod.restriction.some((r) => r.type === 'Others')).toBe(true)
        expect(addedPeriod.restriction.some((r) => r.type === 'DateRange')).toBe(true)
      })
    })
  })

  // ===================================================================
  describe('updateActivitiesDates()', () => {
    it('ignore les restrictions avec ignoreRestrictions=true', async () => {
      const activity = makeActivity({ ignoreRestrictions: true })
      await service.updateActivitiesDates([activity])
      expect(memberService.restrictionSubject).not.toHaveBeenCalled()
    })

    it('retourne { start: undefined, end: undefined } si toutes les activités sont ignorées', async () => {
      const activity = makeActivity({ ignoreRestrictions: true })
      const result = await service.updateActivitiesDates([activity])
      expect(result).toEqual({ start: undefined, end: undefined })
    })

    it('retourne les dates de base si pas de restrictions', async () => {
      const activity = makeActivity({ restrictions: null })
      const result = await service.updateActivitiesDates([activity])
      expect(result.start).toEqual(activity.openAt)
      expect(result.end).toEqual(activity.closeAt)
    })

    it('retourne les dates de base si restrictions est un tableau vide', async () => {
      const activity = makeActivity({ restrictions: [] })
      const result = await service.updateActivitiesDates([activity])
      expect(result.start).toEqual(activity.openAt)
      expect(result.end).toEqual(activity.closeAt)
    })

    describe('accès via Members', () => {
      it("retourne les dates de la période et met à jour l'activité si l'utilisateur est dans la liste des membres", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject(['member-1']))

        const activity = makeActivity({
          restrictions: [
            period(
              { type: 'Members', config: { members: ['member-1'] } },
              { type: 'DateRange', config: { start: START, end: END } }
            ),
          ],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(result).toEqual({ start: START, end: END })
        expect(activity.openAt).toEqual(START)
        expect(activity.closeAt).toEqual(END)
      })

      it("retourne no-access si le membre n'est pas dans la liste", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject(['member-99']))

        const activity = makeActivity({
          restrictions: [period({ type: 'Members', config: { members: ['member-1'] } })],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(isNaN((result.start as Date).getTime())).toBe(true)
        expect(isNaN((result.end as Date).getTime())).toBe(true)
      })

      it("retourne no-access si l'utilisateur n'est pas membre du cours", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject())

        const activity = makeActivity({
          restrictions: [period({ type: 'Members', config: { members: ['member-1'] } })],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(isNaN((result.start as Date).getTime())).toBe(true)
      })
    })

    describe('accès via Correctors', () => {
      it("retourne les dates de la période si l'utilisateur est dans la liste des correcteurs", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject(['corrector-1']))

        const activity = makeActivity({
          restrictions: [
            period(
              { type: 'Correctors', config: { correctors: ['corrector-1'] } },
              { type: 'DateRange', config: { start: START, end: END } }
            ),
          ],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(result).toEqual({ start: START, end: END })
      })
    })

    describe('accès via Groups', () => {
      it("retourne les dates de la période si l'utilisateur est membre du groupe", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject([], ['group-1']))

        const activity = makeActivity({
          restrictions: [
            period(
              { type: 'Groups', config: { groups: ['group-1'] } },
              { type: 'DateRange', config: { start: START, end: END } }
            ),
          ],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(memberService.restrictionSubject).toHaveBeenCalledWith('course-1', user.id)
        expect(result).toEqual({ start: START, end: END })
      })

      it("retourne no-access si l'utilisateur n'est membre d'aucun groupe autorisé", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject([], ['group-2']))

        const activity = makeActivity({
          restrictions: [period({ type: 'Groups', config: { groups: ['group-1'] } })],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(isNaN((result.start as Date).getTime())).toBe(true)
      })

      it('retourne no-access si la config groups est vide', async () => {
        const activity = makeActivity({
          restrictions: [period({ type: 'Groups', config: { groups: [] } })],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(isNaN((result.start as Date).getTime())).toBe(true)
      })

      it('retourne no-access sans erreur quand la restriction vise un groupe supprimé', async () => {
        memberService.restrictionSubject.mockResolvedValue(subject([], ['group-1']))

        const activity = makeActivity({
          restrictions: [period({ type: 'Groups', config: { groups: ['group-supprime'] } })],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(isNaN((result.start as Date).getTime())).toBe(true)
      })
    })

    describe('accès via Others', () => {
      it("retourne les dates de la période Others si l'utilisateur n'est dans aucune période spécifique", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject())

        const activity = makeActivity({
          restrictions: [
            period({ type: 'Members', config: { members: ['member-1'] } }),
            period(
              { type: 'Others', config: { enabled: true } },
              { type: 'DateRange', config: { start: START, end: END } }
            ),
          ],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(result).toEqual({ start: START, end: END })
      })

      it("ne donne pas accès via Others si l'utilisateur est déjà dans une période spécifique", async () => {
        memberService.restrictionSubject.mockResolvedValue(subject(['member-1']))

        const specificStart = new Date('2026-02-01T00:00:00.000Z')
        const specificEnd = new Date('2026-03-01T00:00:00.000Z')

        const activity = makeActivity({
          restrictions: [
            period(
              { type: 'Members', config: { members: ['member-1'] } },
              { type: 'DateRange', config: { start: specificStart, end: specificEnd } }
            ),
            period(
              { type: 'Others', config: { enabled: true } },
              { type: 'DateRange', config: { start: START, end: END } }
            ),
          ],
        })

        const result = await service.updateActivitiesDates([activity])

        expect(result).toEqual({ start: specificStart, end: specificEnd })
      })

      it('ouvre sans dates une période Others sans plage, même pour une requête sans utilisateur', async () => {
        const anonymous = new ActivityDatesService({} as never, memberService as never)
        const activity = makeActivity({ restrictions: [period({ type: 'Others', config: { enabled: true } })] })

        const result = await anonymous.updateActivitiesDates([activity])

        expect(result).toEqual({ start: undefined, end: undefined })
        expect(memberService.restrictionSubject).not.toHaveBeenCalled()
      })
    })

    describe('plusieurs activités', () => {
      it('lit les appartenances une seule fois par cours, et pas pour une activité sans période', async () => {
        const restricted = () =>
          makeActivity({ restrictions: [period({ type: 'Members', config: { members: ['member-1'] } })] })

        await service.updateActivitiesDates([
          restricted(),
          restricted(),
          makeActivity({ restrictions: [] }),
          makeActivity({ courseId: 'course-2', restrictions: null }),
        ])

        expect(memberService.restrictionSubject).toHaveBeenCalledTimes(1)
      })

      it('traite toutes les activités et retourne les dates de la dernière traitée', async () => {
        const end2 = new Date('2026-09-01T00:00:00.000Z')

        memberService.restrictionSubject.mockResolvedValue(subject(['member-1']))

        const a1 = makeActivity({
          restrictions: [
            period(
              { type: 'Members', config: { members: ['member-1'] } },
              { type: 'DateRange', config: { start: START, end: END } }
            ),
          ],
        })
        const a2 = makeActivity({
          restrictions: [
            period(
              { type: 'Members', config: { members: ['member-1'] } },
              { type: 'DateRange', config: { start: START, end: end2 } }
            ),
          ],
        })

        const result = await service.updateActivitiesDates([a1, a2])

        expect(a1.openAt).toEqual(START)
        expect(a2.closeAt).toEqual(end2)
        expect(result).toEqual({ start: START, end: end2 })
      })
    })
  })
})
