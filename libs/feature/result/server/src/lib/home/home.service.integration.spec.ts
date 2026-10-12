import { UserRoles } from '@platon/core/common'
import { LevelEntity, TopicEntity, UserEntity, UserGroupEntity } from '@platon/core/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { CourseMemberRoles, PlayableActivity, RestrictionList } from '@platon/feature/course/common'
import {
  ActivityCorrectorEntity,
  ActivityEntity,
  ActivityGroupEntity,
  ActivityMemberEntity,
  CourseEntity,
  CourseGroupEntity,
  CourseGroupMemberEntity,
  CourseMemberEntity,
  CourseSectionEntity,
} from '@platon/feature/course/server'
import { ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { ResourceEntity } from '@platon/feature/resource/server'
import { DataSource } from 'typeorm'
import { AnswerEntity } from '../answers/answer.entity'
import { CorrectionEntity } from '../correction/correction.entity'
import { SessionEntity } from '../sessions/session.entity'
import { SessionService } from '../sessions/session.service'
import { StudentSubmissionEntity } from '../submissions/submission.entity'
import { HomeService } from './home.service'

const DAY = 24 * 3600 * 1000
const PAST = new Date(Date.now() - 10 * DAY)
const YESTERDAY = new Date(Date.now() - DAY)
const FUTURE = new Date(Date.now() + 10 * DAY)
const LATER = new Date(Date.now() + 20 * DAY)

type ExerciseState = 'NOT_STARTED' | 'STARTED' | 'SUCCEEDED' | 'FAILED' | 'ANSWERED'

interface Exercise {
  grade?: number
  corrected?: number
  answered?: boolean
  state?: ExerciseState
}

interface Copy {
  started?: boolean
  terminatedAt?: Date
  exercises?: Exercise[]
}

describe('HomeService (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let service: HomeService
  let sessions: SessionService

  const save = <T extends object>(entity: new () => T, values: Partial<T>) =>
    dataSource.getRepository(entity).save(dataSource.getRepository(entity).create(values as T))

  let exercise: ResourceEntity
  let section = new Map<string, string>()

  const user = (username: string, role = UserRoles.student) => save(UserEntity, { username, role })

  const course = async (name: string, owner: UserEntity, isTest = false) => {
    const created = await save(CourseEntity, { name, ownerId: owner.id, isTest })
    section.set(created.id, (await save(CourseSectionEntity, { name: 'Section', order: 0, courseId: created.id })).id)
    return created
  }

  const member = (course: CourseEntity, values: Partial<CourseMemberEntity>) =>
    save(CourseMemberEntity, { courseId: course.id, role: CourseMemberRoles.student, ...values })

  const activity = (
    course: CourseEntity,
    creator: UserEntity,
    values: Partial<ActivityEntity> & { title?: string; settings?: object; exerciseGroups?: unknown } = {}
  ) => {
    const { title = 'Activité', settings = {}, exerciseGroups = { 0: [{ id: 'e1' }] }, ...columns } = values
    return save(ActivityEntity, {
      courseId: course.id,
      sectionId: section.get(course.id),
      creatorId: creator.id,
      source: { resource: exercise.id, version: 'latest', variables: { title, settings, exerciseGroups } } as never,
      ...columns,
    })
  }

  const copy = async (activity: ActivityEntity, owner: UserEntity, values: Copy = {}) => {
    const exercises = values.exercises ?? []
    const created = await save(SessionEntity, {
      activityId: activity.id,
      userId: owner.id,
      startedAt: values.started === false ? null : PAST,
      terminatedAt: values.terminatedAt ?? null,
      variables: {
        navigation: {
          started: values.started !== false,
          terminated: !!values.terminatedAt,
          exercises: exercises.map((e) => ({ state: e.state ?? 'NOT_STARTED' })),
        },
      },
      source: { resource: exercise.id, version: 'latest' } as never,
    })
    for (const e of exercises) {
      const correction =
        e.corrected === undefined ? null : await save(CorrectionEntity, { grade: e.corrected, authorId: owner.id })
      const child = await save(SessionEntity, {
        parentId: created.id,
        activityId: activity.id,
        userId: owner.id,
        grade: e.grade ?? -1,
        correctionId: correction?.id ?? null,
        variables: {},
        source: { resource: exercise.id, version: 'latest' } as never,
      })
      if (e.answered) {
        await save(AnswerEntity, {
          sessionId: child.id,
          userId: owner.id,
          grade: e.grade ?? -1,
          variables: { value: 1 } as never,
        })
      }
    }
    return created
  }

  const period = (...restriction: RestrictionList['restriction']): RestrictionList => ({ restriction })

  beforeAll(async () => {
    testDb = await createTestDatabase([
      UserEntity,
      UserGroupEntity,
      LevelEntity,
      TopicEntity,
      ResourceEntity,
      CourseEntity,
      CourseSectionEntity,
      CourseMemberEntity,
      CourseGroupEntity,
      CourseGroupMemberEntity,
      ActivityEntity,
      ActivityMemberEntity,
      ActivityGroupEntity,
      ActivityCorrectorEntity,
      CorrectionEntity,
      StudentSubmissionEntity,
      AnswerEntity,
      SessionEntity,
    ])
    dataSource = testDb.dataSource
    service = new HomeService(dataSource)
    sessions = new SessionService(dataSource.getRepository(SessionEntity), {} as never, {} as never, {} as never)
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  beforeEach(async () => {
    await dataSource.query('TRUNCATE "Users", "Resources", "Courses", "UserGroups", "Corrections" CASCADE')
    section = new Map()
  })

  /**
   * Inès studies AP1 on her own and AP2 through a user group; she archived Archives, Test is an
   * entrance test, and she teaches Tutorat. Théo teaches AP1 and studies AP2. Carl studies AP1
   * through the TD user group, which also holds Tina, who teaches AP1.
   */
  const world = async () => {
    const ines = await user('ines')
    const bob = await user('bob')
    const carl = await user('carl')
    const theo = await user('theo', UserRoles.teacher)
    const tina = await user('tina', UserRoles.teacher)

    const circle = await save(ResourceEntity, {
      name: 'Cercle',
      type: ResourceTypes.CIRCLE,
      status: ResourceStatus.READY,
      ownerId: theo.id,
    })
    exercise = await save(ResourceEntity, {
      name: 'Addition aléatoire',
      type: ResourceTypes.EXERCISE,
      status: ResourceStatus.READY,
      ownerId: theo.id,
      parentId: circle.id,
    })

    const ap1 = await course('AP1', theo)
    const ap2 = await course('AP2', theo)
    const archives = await course('Archives', theo)
    const test = await course('Test', theo, true)
    const tutorat = await course('Tutorat', theo)

    const promo = await save(UserGroupEntity, { name: 'Promo', users: [ines, theo] })
    const tdGroup = await save(UserGroupEntity, { name: 'TD', users: [carl, tina] })

    const inesMember = await member(ap1, { userId: ines.id })
    const bobMember = await member(ap1, { userId: bob.id })
    const theoMember = await member(ap1, { userId: theo.id, role: CourseMemberRoles.teacher })
    const tdRow = await member(ap1, { groupId: tdGroup.id })
    await member(ap1, { userId: tina.id, role: CourseMemberRoles.teacher })
    const promoRow = await member(ap2, { groupId: promo.id })
    await member(archives, { userId: ines.id, archived: true })
    await member(test, { userId: ines.id })
    await member(tutorat, { userId: ines.id, role: CourseMemberRoles.teacher })

    const inesGroup = await save(CourseGroupEntity, { courseId: ap1.id, groupId: 'td-a', name: 'TD A' })
    const otherGroup = await save(CourseGroupEntity, { courseId: ap1.id, groupId: 'td-b', name: 'TD B' })
    await save(CourseGroupMemberEntity, { groupId: inesGroup.groupId, userId: ines.id })
    await save(CourseGroupMemberEntity, { groupId: otherGroup.groupId, userId: bob.id })

    return {
      ines,
      bob,
      carl,
      theo,
      tina,
      ap1,
      ap2,
      archives,
      test,
      tutorat,
      inesMember,
      bobMember,
      theoMember,
      inesGroup,
      otherGroup,
      tdRow,
      promoRow,
    }
  }

  describe('playableActivities', () => {
    it('lists the activities open to the person in the courses they study, with their dates and progress', async () => {
      const w = await world()
      const { ines, bob, theo, ap1, ap2 } = w

      const toAll = await activity(ap1, theo, {
        title: 'TP 1',
        openAt: PAST,
        closeAt: FUTURE,
        settings: { duration: 3600, actions: { retry: 2 } },
        exerciseGroups: {
          0: [{ id: 'e1' }, { id: 'e2' }],
          1: { name: 'Bonus', exercises: [{ id: 'e3' }, { id: 'e4' }] },
        },
      })
      await copy(toAll, ines, {
        exercises: [{ state: 'SUCCEEDED' }, { state: 'STARTED' }, { state: 'NOT_STARTED' }, { state: 'FAILED' }],
      })

      const namedHer = await activity(ap1, theo, {
        title: 'Réservé à Inès',
        settings: { duration: -1, actions: { retry: 0 } },
      })
      await save(ActivityMemberEntity, { activityId: namedHer.id, memberId: w.inesMember.id, userId: ines.id })

      const namedBob = await activity(ap1, theo, { title: 'Réservé à Bob' })
      await save(ActivityMemberEntity, { activityId: namedBob.id, memberId: w.bobMember.id, userId: bob.id })

      const herGroup = await activity(ap1, theo, { title: 'Groupe TD A' })
      await save(ActivityGroupEntity, { activityId: herGroup.id, groupId: w.inesGroup.id })

      const otherGroup = await activity(ap1, theo, { title: 'Groupe TD B' })
      await save(ActivityGroupEntity, { activityId: otherGroup.id, groupId: w.otherGroup.id })

      const herPeriod = await activity(ap1, theo, {
        title: 'Sa période',
        ignoreRestrictions: false,
        restrictions: [
          period(
            { type: 'Members', config: { members: [w.bobMember.id] } },
            { type: 'DateRange', config: { start: PAST, end: YESTERDAY } }
          ),
          period(
            { type: 'Members', config: { members: [w.inesMember.id] } },
            { type: 'DateRange', config: { start: FUTURE, end: LATER } }
          ),
        ],
      })
      const others = await activity(ap1, theo, {
        title: 'Autres',
        ignoreRestrictions: false,
        restrictions: [
          period(
            { type: 'Groups', config: { groups: [w.otherGroup.id] } },
            { type: 'DateRange', config: { start: FUTURE, end: LATER } }
          ),
          period(
            { type: 'Others', config: { enabled: true } },
            { type: 'DateRange', config: { start: PAST, end: YESTERDAY } }
          ),
        ],
      })
      await activity(ap1, theo, {
        title: 'Aucune période',
        ignoreRestrictions: false,
        restrictions: [period({ type: 'Members', config: { members: [w.bobMember.id] } })],
      })
      await activity(ap1, theo, {
        title: 'Groupe supprimé',
        ignoreRestrictions: false,
        restrictions: [period({ type: 'Groups', config: { groups: ['00000000-0000-0000-0000-0000000000de'] } })],
      })
      const herGroupPeriod = await activity(ap1, theo, {
        title: 'Période de son groupe',
        ignoreRestrictions: false,
        restrictions: [
          period(
            { type: 'Groups', config: { groups: [w.inesGroup.id] } },
            { type: 'DateRange', config: { start: FUTURE, end: LATER } }
          ),
        ],
      })
      const namedInGroup = await activity(ap2, theo, {
        title: 'Nommée dans son groupe',
        ignoreRestrictions: false,
        restrictions: [
          period(
            { type: 'Members', config: { members: [`${w.promoRow.id}:${ines.id}`] } },
            { type: 'DateRange', config: { start: PAST, end: FUTURE } }
          ),
        ],
      })
      const wholeGroup = await activity(ap2, theo, {
        title: 'Tout son groupe',
        ignoreRestrictions: false,
        restrictions: [
          period(
            { type: 'Members', config: { members: [w.promoRow.id] } },
            { type: 'DateRange', config: { start: FUTURE, end: LATER } }
          ),
        ],
      })
      const reloaded = await activity(ap1, theo, { title: 'Rechargée' })
      await copy(reloaded, ines, {
        exercises: [{ state: 'SUCCEEDED' }, { state: 'SUCCEEDED' }, { state: 'NOT_STARTED' }],
      })
      const planned = await activity(ap1, theo, { title: 'Planifiée', openAt: FUTURE })
      const closed = await activity(ap1, theo, { title: 'Fermée', openAt: PAST, closeAt: YESTERDAY })
      await copy(closed, ines, { terminatedAt: YESTERDAY, exercises: [{ state: 'ANSWERED' }] })

      const throughGroup = await activity(ap2, theo, {
        title: ' ',
        exerciseGroups: [[{ id: 'e1' }], { exercises: [{ id: 'e2' }] }],
      })
      await copy(throughGroup, ines, { started: false })
      await activity(w.archives, theo, { title: 'Cours archivé' })
      await activity(w.test, theo, { title: "Test d'entrée" })
      await activity(w.tutorat, theo, { title: 'Cours enseigné' })

      const mine = await service.playableActivities(ines.id)
      const byId = new Map(mine.map((a) => [a.id, a]))

      expect(new Set(byId.keys())).toEqual(
        new Set([
          toAll.id,
          namedHer.id,
          herGroup.id,
          herPeriod.id,
          others.id,
          herGroupPeriod.id,
          namedInGroup.id,
          wholeGroup.id,
          reloaded.id,
          planned.id,
          closed.id,
          throughGroup.id,
        ])
      )
      expect(byId.get(toAll.id)).toEqual<PlayableActivity>({
        id: toAll.id,
        courseId: ap1.id,
        courseName: 'AP1',
        title: 'TP 1',
        openAt: PAST,
        closeAt: FUTURE,
        state: 'opened',
        isChallenge: false,
        graded: false,
        duration: 3600,
        attempts: 2,
        exerciseCount: 4,
        exercisesDone: 2,
        started: true,
        terminated: false,
      })
      expect(byId.get(namedHer.id)).toMatchObject({
        duration: undefined,
        attempts: undefined,
        started: false,
        exercisesDone: 0,
      })
      expect(byId.get(herPeriod.id)).toMatchObject({ openAt: FUTURE, closeAt: LATER, state: 'planned' })
      expect(byId.get(others.id)).toMatchObject({ openAt: PAST, closeAt: YESTERDAY, state: 'closed' })
      expect(byId.get(herGroupPeriod.id)).toMatchObject({ openAt: FUTURE, closeAt: LATER, state: 'planned' })
      expect(byId.get(namedInGroup.id)).toMatchObject({ openAt: PAST, closeAt: FUTURE, state: 'opened' })
      expect(byId.get(wholeGroup.id)).toMatchObject({ openAt: FUTURE, state: 'planned' })
      expect(byId.get(reloaded.id)).toMatchObject({ exerciseCount: 3, exercisesDone: 2 })
      expect(byId.get(planned.id)).toMatchObject({ state: 'planned' })
      expect(byId.get(closed.id)).toMatchObject({ state: 'closed', started: true, terminated: true, exercisesDone: 1 })
      expect(byId.get(throughGroup.id)).toMatchObject({
        courseName: 'AP2',
        title: 'Addition aléatoire',
        exerciseCount: 2,
        started: false,
      })
      expect(byId.get(toAll.id)).not.toHaveProperty('code')
      expect(byId.get(toAll.id)).not.toHaveProperty('restrictions')
    })

    it('leaves out a course the person also teaches', async () => {
      const { theo, tina, ap1 } = await world()
      await activity(ap1, theo)

      expect(await service.playableActivities(tina.id)).toEqual([])
    })

    it('lists nothing for a person who studies no course', async () => {
      const { theo, ap1 } = await world()
      await activity(ap1, theo)
      const newcomer = await user('newcomer')

      expect(await service.playableActivities(newcomer.id)).toEqual([])
    })
  })

  describe('taughtActivities', () => {
    it('counts the students an activity is open to, those who started it and the mean of their copies', async () => {
      const w = await world()
      const { ines, bob, carl, theo, tina, ap1, ap2 } = w

      const toAll = await activity(ap1, theo, { title: 'TP 1', openAt: PAST, graded: true })
      await copy(toAll, ines, {
        exercises: [{ grade: 100 }, { grade: 0, corrected: 50 }, { grade: -1 }, { grade: 0 }],
      })
      await copy(toAll, bob, { exercises: [{ grade: 80 }, { grade: 60 }] })
      await copy(toAll, carl, { started: false })
      await copy(toAll, tina, { exercises: [{ grade: 100 }] })
      await copy(toAll, theo, { exercises: [{ grade: 100 }] })

      const namedHer = await activity(ap1, theo, { title: 'Réservé à Inès' })
      await save(ActivityMemberEntity, { activityId: namedHer.id, memberId: w.inesMember.id, userId: ines.id })

      const herGroup = await activity(ap1, tina, { title: 'Groupe TD A' })
      await save(ActivityGroupEntity, { activityId: herGroup.id, groupId: w.inesGroup.id })

      const namedGroup = await activity(ap1, theo, { title: 'Groupe TD nommé' })
      await save(ActivityMemberEntity, { activityId: namedGroup.id, memberId: w.tdRow.id })

      const restricted = await activity(ap1, theo, {
        title: 'Par périodes',
        ignoreRestrictions: false,
        restrictions: [
          period(
            { type: 'Members', config: { members: [w.inesMember.id] } },
            { type: 'DateRange', config: { start: PAST, end: FUTURE } }
          ),
          period({ type: 'Members', config: { members: [`${w.tdRow.id}:${carl.id}`] } }),
        ],
      })
      await copy(restricted, ines, { exercises: [{ grade: 100 }] })
      await copy(restricted, bob, { exercises: [{ grade: 0 }] })

      await activity(ap2, theo, { title: 'Cours étudié' })

      const taught = await service.taughtActivities(theo.id)
      const byId = new Map(taught.map((a) => [a.id, a]))

      expect(new Set(byId.keys())).toEqual(new Set([toAll.id, namedHer.id, herGroup.id, namedGroup.id, restricted.id]))
      expect(byId.get(toAll.id)).toMatchObject({
        courseName: 'AP1',
        title: 'TP 1',
        state: 'opened',
        restricted: false,
        graded: true,
        studentCount: 3,
        startedCount: 2,
        averageGrade: 53.75,
      })
      expect(byId.get(namedGroup.id)).toMatchObject({ studentCount: 1 })
      expect(byId.get(restricted.id)).toMatchObject({
        restricted: true,
        studentCount: 2,
        startedCount: 1,
        averageGrade: 100,
      })
      expect(byId.get(restricted.id)).not.toHaveProperty('restrictions')
      expect(byId.get(restricted.id)).not.toHaveProperty('audience')
      expect(byId.get(namedHer.id)).toMatchObject({ studentCount: 1, startedCount: 0, averageGrade: undefined })
      expect(byId.get(herGroup.id)).toMatchObject({ studentCount: 1 })
    })

    it('leaves out a course the person archived, as the list of their courses does', async () => {
      const { theo, ap1 } = await world()
      const kept = await activity(ap1, theo)
      const old = await course('Ancien', theo)
      await member(old, { userId: theo.id, role: CourseMemberRoles.teacher, archived: true })
      await activity(old, theo)

      expect((await service.taughtActivities(theo.id)).map((a) => a.id)).toEqual([kept.id])
    })

    it('lists only the courses the person teaches, even for an administrator', async () => {
      const { theo, ap1 } = await world()
      await activity(ap1, theo)
      const admin = await user('admin', UserRoles.admin)
      const own = await course('Cours de l’admin', admin)
      await member(own, { userId: admin.id, role: CourseMemberRoles.teacher })
      const ownActivity = await activity(own, admin)

      expect((await service.taughtActivities(admin.id)).map((a) => a.id)).toEqual([ownActivity.id])
    })
  })

  describe('recentCopies', () => {
    it('gives the last three terminated copies, with their grade, their correction under way or nothing', async () => {
      const w = await world()
      const { ines, bob, theo, ap1 } = w
      const day = (n: number) => new Date(Date.UTC(2026, 9, n, 8))
      const review = { feedback: { review: true } }

      const graded = await activity(ap1, theo, { title: 'Notée', settings: review })
      const gradedCopy = await copy(graded, ines, {
        terminatedAt: day(5),
        exercises: [{ grade: 100, answered: true }, { grade: 0, corrected: 40 }, { grade: -1 }],
      })

      const correcting = await activity(ap1, theo, { title: 'En correction', settings: review })
      await save(ActivityCorrectorEntity, { activityId: correcting.id, memberId: w.theoMember.id, userId: theo.id })
      const correctingCopy = await copy(correcting, ines, {
        terminatedAt: day(7),
        exercises: [
          { grade: 100, answered: true, corrected: 100 },
          { grade: 0, answered: true },
        ],
      })

      const hidden = await activity(ap1, theo, { title: 'Cachée', settings: { feedback: { review: false } } })
      const hiddenCopy = await copy(hidden, ines, { terminatedAt: day(6), exercises: [{ grade: 100 }] })

      const older = await activity(ap1, theo, { title: 'Ancienne', settings: review })
      await copy(older, ines, { terminatedAt: day(1), exercises: [{ grade: 100 }] })

      const reopened = await activity(ap1, theo, { title: 'Rouverte', settings: review })
      await copy(reopened, ines, { terminatedAt: day(9), exercises: [{ grade: 100 }] })
      await sessions.onReopenActivity({ activityId: reopened.id })

      const notStarted = await activity(ap1, theo, { title: 'Jamais commencée', settings: review })
      await copy(notStarted, ines, { started: false, terminatedAt: day(8) })

      await copy(graded, bob, { terminatedAt: day(10), exercises: [{ grade: 100 }] })

      const recent = await service.recentCopies(ines.id)

      expect(recent).toEqual([
        expect.objectContaining({ sessionId: correctingCopy.id, activityTitle: 'En correction', status: 'correcting' }),
        expect.objectContaining({ sessionId: hiddenCopy.id, status: 'hidden' }),
        expect.objectContaining({
          sessionId: gradedCopy.id,
          activityId: graded.id,
          courseId: ap1.id,
          courseName: 'AP1',
          terminatedAt: day(5),
          status: 'graded',
          grade: 46.67,
        }),
      ])
      expect(recent[0]).not.toHaveProperty('grade')
      expect(recent[1]).not.toHaveProperty('grade')
    })

    it('grades a copy whose answered exercises are all corrected, though its activity has correctors', async () => {
      const w = await world()
      const corrected = await activity(w.ap1, w.theo, { settings: { feedback: { review: true } } })
      await save(ActivityCorrectorEntity, { activityId: corrected.id, memberId: w.theoMember.id, userId: w.theo.id })
      await copy(corrected, w.ines, {
        terminatedAt: new Date(),
        exercises: [{ grade: 0, answered: true, corrected: 80 }, { grade: -1 }],
      })

      expect(await service.recentCopies(w.ines.id)).toEqual([expect.objectContaining({ status: 'graded', grade: 40 })])
    })

    it('dates a copy when its activity closes, keeps an earlier date, and clears both on reopening', async () => {
      const { ines, bob, theo, ap1 } = await world()
      const settings = { feedback: { review: true } }
      const earlier = new Date(Date.UTC(2026, 9, 1, 8))
      const closing = await activity(ap1, theo, { settings })
      const open = await copy(closing, ines, { exercises: [{ grade: 100 }] })
      const done = await copy(closing, bob, { terminatedAt: earlier, exercises: [{ grade: 100 }] })
      const terminatedAt = async (id: string) =>
        (await dataSource.getRepository(SessionEntity).findOneByOrFail({ id })).terminatedAt

      await sessions.onCloseActivity({ activityId: closing.id })

      expect(await terminatedAt(open.id)).toBeInstanceOf(Date)
      expect(await terminatedAt(done.id)).toEqual(earlier)
      expect(await service.recentCopies(ines.id)).toHaveLength(1)

      await sessions.onReopenActivity({ activityId: closing.id })

      expect(await terminatedAt(open.id)).toBeNull()
      expect(await terminatedAt(done.id)).toBeNull()
      expect(await service.recentCopies(ines.id)).toEqual([])
    })
  })
})
