import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { CorrectionStatus } from '@platon/feature/result/common'
import { DataSource } from 'typeorm'
import { CorrectionService } from './correction.service'

/**
 * Runs the summary query against a real PostgreSQL, on the few columns it reads. The copies cover
 * what must and must not count: a copy with an exercise to correct, a corrected one, an exercise
 * never answered, a copy not handed in, the corrector's own copy, an exercise that crashed before
 * any answer, and an exercise whose resource was deleted.
 */
const SCHEMA = [
  `CREATE TABLE "ActivityCorrectorView" (id uuid, activity_id uuid, activity_name text, course_id uuid, course_name text)`,
  `CREATE TABLE "Sessions" (id uuid PRIMARY KEY, parent_id uuid, activity_id uuid, user_id uuid, variables jsonb, correction_id uuid, source jsonb)`,
  `CREATE TABLE "Corrections" (id uuid PRIMARY KEY)`,
  `CREATE TABLE "Answers" (session_id uuid, variables jsonb)`,
  `CREATE TABLE "Resources" (id uuid PRIMARY KEY)`,
]

const CORRECTOR = '00000000-0000-0000-0000-00000000000c'
const ACTIVITY = 'a0000000-0000-0000-0000-000000000001'
const EXERCISE = 'e0000000-0000-0000-0000-000000000001'
const DELETED_EXERCISE = 'e0000000-0000-0000-0000-0000000000ff'

const copy = (id: string, userId: string, terminated = true) => ({ id, userId, terminated })
const COPIES = [
  copy('10000000-0000-0000-0000-00000000000a', '50000000-0000-0000-0000-000000000001'),
  copy('10000000-0000-0000-0000-00000000000b', '50000000-0000-0000-0000-000000000002'),
  copy('10000000-0000-0000-0000-00000000000c', '50000000-0000-0000-0000-000000000003'),
  copy('10000000-0000-0000-0000-00000000000d', '50000000-0000-0000-0000-000000000004', false),
  copy('10000000-0000-0000-0000-00000000000e', CORRECTOR),
  copy('10000000-0000-0000-0000-00000000000f', '50000000-0000-0000-0000-000000000005'),
  copy('10000000-0000-0000-0000-000000000010', '50000000-0000-0000-0000-000000000006'),
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
    await dataSource.query(`INSERT INTO "Resources" VALUES ($1)`, [EXERCISE])
    for (const { id, userId, terminated } of COPIES) {
      await dataSource.query(`INSERT INTO "Sessions" (id, activity_id, user_id, variables) VALUES ($1, $2, $3, $4)`, [
        id,
        ACTIVITY,
        userId,
        { navigation: { terminated } },
      ])
    }
    for (const exercise of EXERCISES) {
      const owner = COPIES.find((c) => c.id === exercise.copy)?.userId
      const correctionId = exercise.corrected ? exercise.id.replace(/^2/, 'f') : null
      if (correctionId) await dataSource.query(`INSERT INTO "Corrections" VALUES ($1)`, [correctionId])
      await dataSource.query(
        `INSERT INTO "Sessions" (id, parent_id, user_id, variables, correction_id, source) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          exercise.id,
          exercise.copy,
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
    await dataSource.query('TRUNCATE "ActivityCorrectorView", "Sessions", "Corrections", "Answers", "Resources"')
    await seed()
  })

  it('devrait compter les exercices et les copies à corriger comme la file de correction', async () => {
    const [summary] = await service.listSummary(CORRECTOR)

    expect(summary).toMatchObject({ activityId: ACTIVITY, totalExercises: 6, correctedExercises: 4, pendingCopies: 2 })
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
