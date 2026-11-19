import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { CorrectionStatus } from '@platon/feature/result/common'
import { DataSource } from 'typeorm'
import { CorrectionService } from './correction.service'

/**
 * Runs the correction queue and its summary against a real PostgreSQL, on the few columns they read.
 * The copies cover what must and must not count: a copy with an exercise to correct, a corrected
 * one, an exercise never answered, a copy not handed in, the corrector's own copy, an exercise that
 * crashed before any answer, and an exercise whose resource was deleted.
 */
const SCHEMA = [
  `CREATE TABLE "ActivityCorrectorView" (id uuid, activity_id uuid, activity_name text, course_id uuid, course_name text)`,
  `CREATE TABLE "Sessions" (id uuid PRIMARY KEY, parent_id uuid, activity_id uuid, user_id uuid, variables jsonb, correction_id uuid, source jsonb, terminated_at timestamptz, grade float DEFAULT -1)`,
  `CREATE TABLE "Corrections" (id uuid PRIMARY KEY, author_id uuid DEFAULT '00000000-0000-0000-0000-00000000000c', grade float DEFAULT 50, created_at timestamptz DEFAULT now(), updated_at timestamptz)`,
  `CREATE TABLE "Answers" (session_id uuid, variables jsonb)`,
  `CREATE TABLE "Resources" (id uuid PRIMARY KEY, name text)`,
  `CREATE TABLE "Activities" (id uuid PRIMARY KEY, course_id uuid, source jsonb)`,
  `CREATE TABLE "Courses" (id uuid PRIMARY KEY, name text)`,
  `CREATE TABLE "CorrectionLabels" (session_id uuid, label_id uuid)`,
  `CREATE TABLE "Labels" (id uuid PRIMARY KEY, name text, color text, description text)`,
  `CREATE TABLE "StudentSubmissions" (session_id uuid)`,
]

const CORRECTOR = '00000000-0000-0000-0000-00000000000c'
const ACTIVITY = 'a0000000-0000-0000-0000-000000000001'
const EXERCISE = 'e0000000-0000-0000-0000-000000000001'
const DELETED_EXERCISE = 'e0000000-0000-0000-0000-0000000000ff'
const COURSE = 'c0000000-0000-0000-0000-000000000001'

/** The copies that do not count were handed in last, so that the latest date counted is theirs if they leak. */
const copy = (id: string, userId: string, terminatedAt: string | null) => ({
  id,
  userId,
  terminated: !!terminatedAt,
  terminatedAt,
})
const COPIES = [
  copy('10000000-0000-0000-0000-00000000000a', '50000000-0000-0000-0000-000000000001', '2026-10-01T08:00:00Z'),
  copy('10000000-0000-0000-0000-00000000000b', '50000000-0000-0000-0000-000000000002', '2026-10-03T08:00:00Z'),
  copy('10000000-0000-0000-0000-00000000000c', '50000000-0000-0000-0000-000000000003', '2026-10-02T08:00:00Z'),
  copy('10000000-0000-0000-0000-00000000000d', '50000000-0000-0000-0000-000000000004', null),
  copy('10000000-0000-0000-0000-00000000000e', CORRECTOR, '2026-10-09T08:00:00Z'),
  copy('10000000-0000-0000-0000-00000000000f', '50000000-0000-0000-0000-000000000005', '2026-10-01T09:00:00Z'),
  copy('10000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000006', '2026-10-08T08:00:00Z'),
]

interface Exercise {
  id: string
  copy: string
  answered: boolean
  corrected: boolean
  crashed?: boolean
  resource?: string
}
const EXERCISES: Exercise[] = [
  { id: '20000000-0000-0000-0000-0000000000a1', copy: COPIES[0].id, answered: true, corrected: true },
  { id: '20000000-0000-0000-0000-0000000000a2', copy: COPIES[0].id, answered: true, corrected: false },
  { id: '20000000-0000-0000-0000-0000000000b1', copy: COPIES[1].id, answered: true, corrected: true },
  { id: '20000000-0000-0000-0000-0000000000b2', copy: COPIES[1].id, answered: true, corrected: true },
  { id: '20000000-0000-0000-0000-0000000000c1', copy: COPIES[2].id, answered: true, corrected: true },
  { id: '20000000-0000-0000-0000-0000000000c2', copy: COPIES[2].id, answered: false, corrected: false },
  { id: '20000000-0000-0000-0000-0000000000d1', copy: COPIES[3].id, answered: true, corrected: false },
  { id: '20000000-0000-0000-0000-0000000000e1', copy: COPIES[4].id, answered: true, corrected: false },
  { id: '20000000-0000-0000-0000-0000000000f1', copy: COPIES[5].id, answered: false, corrected: false, crashed: true },
  {
    id: '20000000-0000-0000-0000-000000000101',
    copy: COPIES[6].id,
    answered: true,
    corrected: false,
    resource: DELETED_EXERCISE,
  },
]

describe('CorrectionService.listSummary (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let service: CorrectionService

  const seed = async () => {
    await dataSource.query(`INSERT INTO "ActivityCorrectorView" VALUES ($1, $2, 'TP 3', $3, 'AP1')`, [
      CORRECTOR,
      ACTIVITY,
      'c0000000-0000-0000-0000-000000000001',
    ])
    await dataSource.query(`INSERT INTO "Resources" VALUES ($1, 'Exercice')`, [EXERCISE])
    await dataSource.query(`INSERT INTO "Courses" VALUES ($1, 'AP1')`, [COURSE])
    await dataSource.query(`INSERT INTO "Activities" VALUES ($1, $2, $3)`, [ACTIVITY, COURSE, { variables: {} }])
    for (const { id, userId, terminated, terminatedAt } of COPIES) {
      await dataSource.query(
        `INSERT INTO "Sessions" (id, activity_id, user_id, variables, terminated_at) VALUES ($1, $2, $3, $4, $5)`,
        [id, ACTIVITY, userId, { navigation: { terminated } }, terminatedAt]
      )
    }
    for (const exercise of EXERCISES) {
      const owner = COPIES.find((c) => c.id === exercise.copy)?.userId
      const correctionId = exercise.corrected ? exercise.id.replace(/^2/, 'f') : null
      if (correctionId) await dataSource.query(`INSERT INTO "Corrections" VALUES ($1)`, [correctionId])
      await dataSource.query(
        `INSERT INTO "Sessions" (id, parent_id, activity_id, user_id, variables, correction_id, source) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          exercise.id,
          exercise.copy,
          ACTIVITY,
          owner,
          exercise.crashed ? { '.meta': { error: true } } : {},
          correctionId,
          { resource: exercise.resource ?? EXERCISE },
        ]
      )
      if (exercise.answered) {
        await dataSource.query(`INSERT INTO "Answers" VALUES ($1, $2)`, [exercise.id, { value: 1 }])
      }
    }
  }

  beforeAll(async () => {
    testDb = await createTestDatabase([], SCHEMA)
    dataSource = testDb.dataSource
    const sessions = { query: (query: string, parameters: unknown[]) => dataSource.query(query, parameters) }
    service = new CorrectionService({} as never, sessions as never, {} as never)
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE "ActivityCorrectorView", "Sessions", "Corrections", "Answers", "Resources", "Activities", "Courses"'
    )
    await seed()
  })

  it('devrait compter les exercices et les copies à corriger comme la file de correction', async () => {
    const [summary] = await service.listSummary(CORRECTOR)

    expect(summary).toMatchObject({ activityId: ACTIVITY, totalExercises: 6, correctedExercises: 4, pendingCopies: 2 })
  })

  it('devrait compter les copies rendues et dater la dernière, comme les copies à corriger', async () => {
    const [summary] = await service.listSummary(CORRECTOR)

    expect(summary).toMatchObject({ submittedCopies: 4, lastSubmittedAt: new Date('2026-10-03T08:00:00Z') })
  })

  it('devrait lister dans la file exactement les exercices que le résumé compte', async () => {
    const [summary] = await service.listSummary(CORRECTOR)
    const queue = (await service.list(CORRECTOR)).flatMap((activity) => activity.exercises)

    expect(queue).toHaveLength(summary.totalExercises)
    expect(queue.filter((exercise) => exercise.correctedBy)).toHaveLength(summary.correctedExercises)
  })

  it("devrait lister en lecture seule tous les exercices de l'activité dont la ressource existe", async () => {
    const exercises = (await service.list(CORRECTOR, ACTIVITY, true)).flatMap((activity) => activity.exercises)

    expect(exercises).toHaveLength(EXERCISES.filter((exercise) => !exercise.resource).length)
  })

  it("devrait garder l'activité en attente tant qu'une copie attend", async () => {
    expect(await service.listSummary(CORRECTOR, CorrectionStatus.pending)).toHaveLength(1)
    expect(await service.listSummary(CORRECTOR, CorrectionStatus.available)).toHaveLength(0)
  })

  it('devrait passer à zéro copie une fois tout corrigé', async () => {
    for (const id of ['20000000-0000-0000-0000-0000000000a2', '20000000-0000-0000-0000-0000000000f1']) {
      const correctionId = id.replace(/^2/, 'f')
      await dataSource.query(`INSERT INTO "Corrections" VALUES ($1)`, [correctionId])
      await dataSource.query(`UPDATE "Sessions" SET correction_id = $1 WHERE id = $2`, [correctionId, id])
    }

    const [summary] = await service.listSummary(CORRECTOR, CorrectionStatus.available)
    expect(summary).toMatchObject({ totalExercises: 6, correctedExercises: 6, pendingCopies: 0 })
  })
})
