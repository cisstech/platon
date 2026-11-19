import { AuthService, UserService } from '@platon/core/server'
import { CasVersions } from '@platon/feature/cas/common'
import { LmsEntity, LTIService } from '@platon/feature/lti/server'
import { createTestDatabase, TestDatabase } from '@platon/core/testing/server'
import { DataSource, QueryFailedError, Repository } from 'typeorm'
import { CasEntity } from './entities/cas.entity'
import { AxiosService } from './axios.service'
import { CasService } from './cas.service'

/**
 * Contrairement à cas.service.spec.ts (repository/query builder mockés), ce fichier fait tourner
 * CasService contre un vrai Postgres (Testcontainers) pour exercer les 3 contraintes uniques
 * déclarées sur CasEntity (name, loginURL, serviceValidateURL) et la relation ManyToMany réelle
 * avec LmsEntity (jointure lmses), qu'aucun mock de repository ne peut valider.
 */
describe('CasService (integration)', () => {
  let testDb: TestDatabase
  let dataSource: DataSource
  let casRepo: Repository<CasEntity>
  let lmsRepo: Repository<LmsEntity>
  let service: CasService

  const fakeLtiService = { findLmsById: jest.fn() } as unknown as LTIService

  beforeAll(async () => {
    testDb = await createTestDatabase([LmsEntity, CasEntity])
    dataSource = testDb.dataSource
    casRepo = dataSource.getRepository(CasEntity)
    lmsRepo = dataSource.getRepository(LmsEntity)

    // The CAS sign-in is not exercised here: its collaborators stay empty.
    service = new CasService(casRepo, fakeLtiService, {} as UserService, {} as AuthService, {} as AxiosService)
  }, 60_000)

  afterAll(async () => {
    await testDb.teardown()
  })

  afterEach(async () => {
    await dataSource.query('DELETE FROM "Cas"')
    await dataSource.query('DELETE FROM "Lmses"')
  })

  let counter = 0
  const seedCas = async (overrides: Partial<CasEntity> = {}): Promise<CasEntity> => {
    counter++
    return service.createCas({
      name: `cas-${counter}`,
      loginURL: `https://cas-${counter}.example.com/login`,
      serviceValidateURL: `https://cas-${counter}.example.com/serviceValidate`,
      version: CasVersions.V3,
      ...overrides,
    })
  }

  const seedLms = async (): Promise<LmsEntity> => {
    counter++
    return lmsRepo.save(
      lmsRepo.create({
        name: `Moodle ${counter}`,
        url: 'https://moodle.example.com',
        outcomeUrl: 'https://moodle.example.com/outcomes',
        consumerKey: `consumer-key-${counter}`,
        consumerSecret: 'secret',
      })
    )
  }

  describe('contraintes uniques', () => {
    it('devrait rejeter deux CAS avec le même name', async () => {
      await seedCas({ name: 'shared-name' })

      await expect(seedCas({ name: 'shared-name' })).rejects.toBeInstanceOf(QueryFailedError)
    })

    it('devrait rejeter deux CAS avec la même loginURL', async () => {
      await seedCas({ loginURL: 'https://shared.example.com/login' })

      await expect(seedCas({ loginURL: 'https://shared.example.com/login' })).rejects.toBeInstanceOf(QueryFailedError)
    })

    it('devrait rejeter deux CAS avec la même serviceValidateURL', async () => {
      await seedCas({ serviceValidateURL: 'https://shared.example.com/serviceValidate' })

      await expect(
        seedCas({ serviceValidateURL: 'https://shared.example.com/serviceValidate' })
      ).rejects.toBeInstanceOf(QueryFailedError)
    })
  })

  describe('relation ManyToMany avec les LMS', () => {
    it('devrait persister et recharger les LMS associés à un CAS', async () => {
      const lms1 = await seedLms()
      const lms2 = await seedLms()
      const cas = await seedCas({ lmses: [lms1, lms2] })

      const found = await service.findCasByName(cas.name)

      expect(found.isPresent()).toBe(true)
      const lmsIds = found
        .get()
        .lmses.map((l) => l.id)
        .sort()
      expect(lmsIds).toEqual([lms1.id, lms2.id].sort())
    })

    it('devrait retourner un CAS sans LMS associé avec un tableau lmses vide', async () => {
      const cas = await seedCas()

      const found = await service.findCasByName(cas.name)

      expect(found.get().lmses).toEqual([])
    })
  })

  describe('searchCas', () => {
    it('devrait filtrer par nom insensible à la casse et trier par nom', async () => {
      await seedCas({ name: 'Alpha CAS' })
      await seedCas({ name: 'Beta CAS' })

      const [items, total] = await service.searchCas({ search: 'alpha' })

      expect(total).toBe(1)
      expect(items[0].name).toBe('Alpha CAS')
    })

    it('devrait paginer avec offset/limit sur le tri par défaut', async () => {
      await seedCas({ name: 'A CAS' })
      await seedCas({ name: 'B CAS' })
      await seedCas({ name: 'C CAS' })

      const [items, total] = await service.searchCas({ offset: 1, limit: 1 })

      expect(total).toBe(3)
      expect(items).toHaveLength(1)
      expect(items[0].name).toBe('B CAS')
    })

    it('devrait trier explicitement par NAME/CREATED_AT/UPDATED_AT sans lever de colonne ambiguë avec la jointure lmses', async () => {
      const lms = await seedLms()
      await seedCas({ name: 'Z CAS', lmses: [lms] })
      await seedCas({ name: 'A CAS', lmses: [lms] })

      const byName = await service.searchCas({ order: 'NAME' as never })
      expect(byName[0][0].name).toBe('A CAS')

      await expect(service.searchCas({ order: 'CREATED_AT' as never })).resolves.toBeDefined()
      await expect(service.searchCas({ order: 'UPDATED_AT' as never })).resolves.toBeDefined()
    })

    it('devrait filtrer par nom sans lever de colonne ambiguë quand un CAS a des LMS associés', async () => {
      const lms = await seedLms()
      await seedCas({ name: 'Alpha CAS', lmses: [lms] })

      const [items, total] = await service.searchCas({ search: 'alpha' })

      expect(total).toBe(1)
      expect(items[0].name).toBe('Alpha CAS')
    })
  })

  describe('updateCas', () => {
    it('devrait fusionner les changements et sauvegarder', async () => {
      const cas = await seedCas({ name: 'Old name' })

      const updated = await service.updateCas(cas.id, { name: 'New name' })

      expect(updated.name).toBe('New name')
      const persisted = await casRepo.findOneBy({ id: cas.id })
      expect(persisted?.name).toBe('New name')
    })
  })

  describe('deleteCas / deleteCasByName', () => {
    it('devrait supprimer un CAS par id', async () => {
      const cas = await seedCas()

      await service.deleteCas(cas.id)

      expect(await casRepo.findOneBy({ id: cas.id })).toBeNull()
    })

    it('devrait supprimer un CAS par name', async () => {
      const cas = await seedCas({ name: 'to-delete' })

      await service.deleteCasByName('to-delete')

      expect(await casRepo.findOneBy({ id: cas.id })).toBeNull()
    })
  })
})
