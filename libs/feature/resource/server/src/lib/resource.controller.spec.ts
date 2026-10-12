import { InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestResponse, ForbiddenResponse, NotFoundResponse, UserRoles } from '@platon/core/common'
import { IRequest, UserService } from '@platon/core/server'
import { createUserEntity } from '@platon/core/testing/server'
import { NotificationService } from '@platon/feature/notification/server'
import { ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { Optional } from 'typescript-optional'
import { ResourceFileService } from './files'
import { ResourcePermissionService } from './permissions/permissions.service'
import { ResourceController } from './resource.controller'
import { ResourceEntity } from './resource.entity'
import { ResourceService } from './resource.service'
import { ResourceViewService } from './views/view.service'
import { ResourceDependencyService } from './dependency'

describe('ResourceController', () => {
  let controller: ResourceController
  let resourceService: jest.Mocked<ResourceService>
  let permissionService: jest.Mocked<ResourcePermissionService>
  let resourceViewService: jest.Mocked<ResourceViewService>
  let userService: jest.Mocked<UserService>
  let notificationService: jest.Mocked<NotificationService>
  let fileService: jest.Mocked<ResourceFileService>
  let dependencyService: jest.Mocked<ResourceDependencyService>

  const fullPermissions = { read: true, write: true } as never
  const readOnlyPermissions = { read: true, write: false } as never
  const noPermissions = { read: false, write: false } as never

  const buildResource = (overrides: Partial<ResourceEntity> = {}): ResourceEntity =>
    ({
      id: 'resource-1',
      name: 'Resource 1',
      type: ResourceTypes.CIRCLE,
      status: ResourceStatus.READY,
      personal: false,
      ...overrides,
    } as ResourceEntity)

  const buildReq = (overrides: Partial<ReturnType<typeof createUserEntity>> = {}): IRequest =>
    ({ user: createUserEntity({ role: UserRoles.teacher, ...overrides }) } as unknown as IRequest)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        {
          provide: ResourceService,
          useValue: {
            search: jest.fn(),
            tree: jest.fn(),
            getPersonal: jest.fn(),
            completion: jest.fn(),
            getAllOwners: jest.fn(),
            findByIdOrCode: jest.fn(),
            getById: jest.fn(),
            create: jest.fn(),
            fromInput: jest.fn(),
            update: jest.fn(),
            move: jest.fn(),
            delete: jest.fn(),
            isConfigurableExercise: jest.fn(),
            updateCertification: jest.fn(),
          },
        },
        {
          provide: ResourcePermissionService,
          useValue: { userPermissionsOnResource: jest.fn(), userPermissionsOnResources: jest.fn() },
        },
        {
          provide: ResourceViewService,
          useValue: { findAll: jest.fn(), create: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: UserService, useValue: { findById: jest.fn() } },
        { provide: NotificationService, useValue: { sendToUser: jest.fn().mockResolvedValue(undefined) } },
        { provide: ResourceFileService, useValue: { repo: jest.fn(), copy: jest.fn() } },
        {
          provide: ResourceDependencyService,
          useValue: { updateTemplateDependency: jest.fn(), deleteDependencyForVersion: jest.fn() },
        },
      ],
    }).compile()

    controller = module.get(ResourceController)
    resourceService = module.get(ResourceService)
    permissionService = module.get(ResourcePermissionService)
    resourceViewService = module.get(ResourceViewService)
    userService = module.get(UserService)
    notificationService = module.get(NotificationService)
    fileService = module.get(ResourceFileService)
    dependencyService = module.get(ResourceDependencyService)

    permissionService.userPermissionsOnResource.mockResolvedValue(fullPermissions)
  })

  describe('search', () => {
    it('devrait rechercher via ResourceViewService quand filters.views est fourni', async () => {
      const resource = buildResource()
      const viewedAt = new Date('2026-10-12T08:00:00Z')
      resourceViewService.findAll.mockResolvedValue([[{ resource, updatedAt: viewedAt } as never], 1])
      const req = buildReq()

      const result = await controller.search(req, { views: true } as never)

      expect(resourceViewService.findAll).toHaveBeenCalledWith(req.user.id)
      expect(resourceService.search).not.toHaveBeenCalled()
      expect(result.total).toBe(1)
      expect(result.resources[0]).toMatchObject({ id: resource.id, viewedAt })
    })

    it("devrait rechercher via ResourceService sinon, filtré sur l'utilisateur courant", async () => {
      resourceService.search.mockResolvedValue([[buildResource()], 1])
      const req = buildReq()

      const result = await controller.search(req, {})

      expect(resourceService.search).toHaveBeenCalledWith({}, req.user.id)
      expect(result.total).toBe(1)
    })
  })

  describe('tree', () => {
    it("devrait construire l'arbre, ajouter le cercle personnel et injecter les permissions", async () => {
      const circle = buildResource({ id: 'circle-1' })
      const personal = buildResource({ id: 'personal-1' })
      resourceService.search.mockResolvedValue([[circle], 1])
      resourceService.getPersonal.mockResolvedValue(personal)
      resourceService.tree.mockResolvedValue({ id: 'circle-1', children: [] } as never)
      permissionService.userPermissionsOnResources.mockResolvedValue([
        { resource: circle, permissions: fullPermissions },
      ])
      const req = buildReq()

      const result = await controller.tree(req)

      expect(resourceService.getPersonal).toHaveBeenCalledWith(req.user)
      expect(result.resource.id).toBe('circle-1')
    })
  })

  describe('completion', () => {
    it('devrait retourner la ressource de complétion mappée', async () => {
      resourceService.completion.mockResolvedValue({ levels: [], topics: [], names: [] })
      const req = buildReq()

      const result = await controller.completion(req)

      expect(resourceService.completion).toHaveBeenCalledWith(req.user)
      expect(result.resource).toBeDefined()
    })
  })

  describe('listOwners', () => {
    it('devrait retourner tous les propriétaires mappés', async () => {
      const owner = createUserEntity({ username: 'owner1' })
      resourceService.getAllOwners.mockResolvedValue([owner as never])

      const result = await controller.listOwners()

      expect(result.total).toBe(1)
      expect(result.resources[0].username).toBe('owner1')
    })
  })

  describe('find', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.find(buildReq(), 'unknown')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter avec ForbiddenResponse si l'utilisateur n'a pas la permission de lecture", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      permissionService.userPermissionsOnResource.mockResolvedValue(noPermissions)

      await expect(controller.find(buildReq(), 'resource-1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait retourner la ressource avec ses permissions', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))

      const result = await controller.find(buildReq(), 'resource-1')

      expect((result.resource as never as { permissions: unknown }).permissions).toEqual(fullPermissions)
    })

    it('devrait marquer la ressource comme vue sans bloquer la réponse quand markAsViewed est fourni', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      const req = buildReq()

      await controller.find(req, 'resource-1', 'true')

      expect(resourceViewService.create).toHaveBeenCalledWith({ resourceId: 'resource-1', userId: req.user.id })
    })
  })

  describe('create', () => {
    it("devrait rejeter avec NotFoundResponse si le parent n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(
        controller.create(buildReq(), { parentId: 'unknown', name: 'New', type: ResourceTypes.CIRCLE } as never)
      ).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter avec ForbiddenResponse si l'utilisateur n'a pas la permission d'écriture sur le parent", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      permissionService.userPermissionsOnResource.mockResolvedValue(readOnlyPermissions)

      await expect(
        controller.create(buildReq(), { parentId: 'parent-1', name: 'New', type: ResourceTypes.CIRCLE } as never)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait rejeter si un exercice est créé sans le fichier main.py', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))

      await expect(
        controller.create(buildReq(), {
          parentId: 'parent-1',
          name: 'New',
          type: ResourceTypes.EXERCISE,
          files: [{ path: 'other.py', content: '' }],
        } as never)
      ).rejects.toBeInstanceOf(BadRequestResponse)
    })

    it('devrait créer la ressource et écrire les fichiers fournis', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      resourceService.fromInput.mockResolvedValue({ name: 'New' } as never)
      const created = buildResource({ id: 'new-resource' })
      resourceService.create.mockResolvedValue(created)
      const req = buildReq()

      const result = await controller.create(req, {
        parentId: 'parent-1',
        name: 'New',
        type: ResourceTypes.CIRCLE,
      } as never)

      expect(resourceService.create).toHaveBeenCalledWith(expect.objectContaining({ ownerId: req.user.id }))
      expect(result.resource.id).toBe('new-resource')
    })
  })

  describe('duplicateResource', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.duplicateResource(buildReq(), 'unknown')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait rejeter si le type de ressource ne peut pas être dupliqué', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.CIRCLE })))

      await expect(controller.duplicateResource(buildReq(), 'resource-1')).rejects.toBeInstanceOf(BadRequestResponse)
    })

    it("devrait rejeter avec ForbiddenResponse si l'utilisateur n'a pas accès en lecture", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.EXERCISE })))
      permissionService.userPermissionsOnResource.mockResolvedValue(noPermissions)

      await expect(controller.duplicateResource(buildReq(), 'resource-1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait dupliquer la ressource et copier ses fichiers', async () => {
      const existing = buildResource({ type: ResourceTypes.EXERCISE })
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(existing))
      resourceService.getPersonal.mockResolvedValue(buildResource({ id: 'circle-1' }))
      const duplicated = buildResource({ id: 'duplicated-1', type: ResourceTypes.EXERCISE })
      resourceService.create.mockResolvedValue(duplicated)

      const result = await controller.duplicateResource(buildReq(), 'resource-1')

      expect(fileService.copy).toHaveBeenCalledWith('resource-1', 'duplicated-1', expect.anything())
      expect(result.resource.id).toBe('duplicated-1')
    })

    it('devrait supprimer la ressource dupliquée si la copie des fichiers échoue', async () => {
      const existing = buildResource({ type: ResourceTypes.EXERCISE })
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(existing))
      resourceService.getPersonal.mockResolvedValue(buildResource({ id: 'circle-1' }))
      const duplicated = buildResource({ id: 'duplicated-1', type: ResourceTypes.EXERCISE })
      resourceService.create.mockResolvedValue(duplicated)
      fileService.copy.mockRejectedValue(new Error('copy failed'))

      await expect(controller.duplicateResource(buildReq(), 'resource-1')).rejects.toThrow('copy failed')
      expect(resourceService.delete).toHaveBeenCalledWith(duplicated)
    })
  })

  describe('createPreview', () => {
    it('devrait rejeter si le fichier main.py est manquant', async () => {
      await expect(
        controller.createPreview(buildReq(), { files: [{ path: 'other.py', content: '' }] } as never)
      ).rejects.toBeInstanceOf(BadRequestResponse)
    })

    it("devrait lever une InternalServerErrorException si l'utilisateur par défaut est introuvable", async () => {
      userService.findById.mockResolvedValue(Optional.empty())

      await expect(
        controller.createPreview(buildReq(), { files: [{ path: 'main.ple', content: '' }] } as never)
      ).rejects.toBeInstanceOf(InternalServerErrorException)
    })

    it("devrait créer une nouvelle ressource de preview quand aucun resourceId n'est fourni", async () => {
      userService.findById.mockResolvedValue(Optional.of(createUserEntity() as never))
      resourceService.getPersonal.mockResolvedValue(buildResource({ id: 'circle-1' }))
      const created = buildResource({ id: 'preview-1', type: ResourceTypes.EXERCISE })
      resourceService.create.mockResolvedValue(created)
      fileService.repo.mockResolvedValue({ repo: { write: jest.fn() } } as never)

      const result = await controller.createPreview(buildReq(), {
        files: [{ path: 'main.ple', content: 'code' }],
      } as never)

      expect(resourceService.create).toHaveBeenCalled()
      expect(result.resource.id).toBe('preview-1')
    })

    it('devrait réutiliser la ressource existante et réécrire ses fichiers quand resourceId est fourni', async () => {
      userService.findById.mockResolvedValue(Optional.of(createUserEntity() as never))
      const existing = buildResource({ id: 'preview-1', type: ResourceTypes.EXERCISE })
      resourceService.getById.mockResolvedValue(existing)
      const write = jest.fn()
      fileService.repo.mockResolvedValue({ repo: { write } } as never)

      await controller.createPreview(buildReq(), {
        resourceId: 'preview-1',
        files: [{ path: 'main.ple', content: 'code' }],
      } as never)

      expect(resourceService.create).not.toHaveBeenCalled()
      expect(write).toHaveBeenCalledWith('main.ple', 'code')
    })
  })

  describe('update', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.update(buildReq(), 'unknown', {} as never)).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter avec ForbiddenResponse si l'utilisateur n'a pas la permission d'écriture", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      permissionService.userPermissionsOnResource.mockResolvedValue(readOnlyPermissions)

      await expect(controller.update(buildReq(), 'resource-1', {} as never)).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait mettre à jour la ressource', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      resourceService.fromInput.mockResolvedValue({ name: 'New' } as never)
      resourceService.update.mockResolvedValue(buildResource({ name: 'New' }))

      const result = await controller.update(buildReq(), 'resource-1', { name: 'New' } as never)

      expect(result.resource.name).toBe('New')
    })
  })

  describe('move', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.move(buildReq(), 'unknown', 'parent-1')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter avec ForbiddenResponse pour un non-admin si le cercle parent n'est pas personnel", async () => {
      const resource = buildResource({ parentId: 'parent-circle' } as never)
      const parentCircle = buildResource({ id: 'parent-circle', personal: false })
      resourceService.findByIdOrCode
        .mockResolvedValueOnce(Optional.of(resource))
        .mockResolvedValueOnce(Optional.of(parentCircle))

      await expect(
        controller.move(buildReq({ role: UserRoles.teacher }), 'resource-1', 'new-parent')
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("devrait autoriser un admin même si le cercle parent actuel n'est pas personnel", async () => {
      const resource = buildResource({ parentId: 'parent-circle' } as never)
      const parentCircle = buildResource({ id: 'parent-circle', personal: false })
      resourceService.findByIdOrCode
        .mockResolvedValueOnce(Optional.of(resource))
        .mockResolvedValueOnce(Optional.of(parentCircle))
      resourceService.move.mockResolvedValue(buildResource({ parentId: 'new-parent' } as never))

      const result = await controller.move(buildReq({ role: UserRoles.admin }), 'resource-1', 'new-parent')

      expect(result.resource).toBeDefined()
    })
  })

  describe('moveToOwnerCircle', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(
        controller.moveToOwnerCircle(buildReq({ role: UserRoles.admin }), 'unknown', 'owner-1')
      ).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait rejeter si la ressource est un cercle', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.CIRCLE })))

      await expect(
        controller.moveToOwnerCircle(buildReq({ role: UserRoles.admin }), 'resource-1', 'owner-1')
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait rejeter pour un non-admin', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.EXERCISE })))

      await expect(
        controller.moveToOwnerCircle(buildReq({ role: UserRoles.teacher }), 'resource-1', 'owner-1')
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it("devrait rejeter avec NotFoundResponse si le nouveau propriétaire n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.EXERCISE })))
      userService.findById.mockResolvedValue(Optional.empty())

      await expect(
        controller.moveToOwnerCircle(buildReq({ role: UserRoles.admin }), 'resource-1', 'unknown-owner')
      ).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait déplacer la ressource vers le cercle personnel du nouveau propriétaire et notifier', async () => {
      const existing = buildResource({ type: ResourceTypes.EXERCISE, parentId: 'old-parent' } as never)
      resourceService.findByIdOrCode
        .mockResolvedValueOnce(Optional.of(existing))
        .mockResolvedValueOnce(Optional.of(buildResource({ id: 'old-parent' })))
      userService.findById.mockResolvedValue(Optional.of(createUserEntity({ id: 'new-owner' }) as never))
      resourceService.getPersonal.mockResolvedValue(buildResource({ id: 'new-owner-circle' }))
      resourceService.move.mockResolvedValue(buildResource({ id: 'resource-1', parentId: 'new-owner-circle' } as never))

      const result = await controller.moveToOwnerCircle(buildReq({ role: UserRoles.admin }), 'resource-1', 'new-owner')

      expect(resourceService.move).toHaveBeenCalledWith('resource-1', 'new-owner-circle')
      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'new-owner',
        expect.objectContaining({ type: 'RESOURCE-MOVED-BY-ADMIN' })
      )
      expect(result.resource).toBeDefined()
    })
  })

  describe('delete', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.delete(buildReq(), 'unknown')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter avec ForbiddenResponse si le cercle parent n'est pas personnel", async () => {
      const resource = buildResource({ parentId: 'parent-1' } as never)
      resourceService.findByIdOrCode
        .mockResolvedValueOnce(Optional.of(resource))
        .mockResolvedValueOnce(Optional.of(buildResource({ id: 'parent-1', personal: false })))

      await expect(controller.delete(buildReq(), 'resource-1')).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait supprimer le dépôt de fichiers puis la ressource', async () => {
      const resource = buildResource({ parentId: 'parent-1' } as never)
      resourceService.findByIdOrCode
        .mockResolvedValueOnce(Optional.of(resource))
        .mockResolvedValueOnce(Optional.of(buildResource({ id: 'parent-1', personal: true })))
      const removeRepo = jest.fn().mockResolvedValue(undefined)
      fileService.repo.mockResolvedValue({ repo: { removeRepo } } as never)

      await controller.delete(buildReq(), 'resource-1')

      expect(removeRepo).toHaveBeenCalled()
      expect(resourceService.delete).toHaveBeenCalledWith(resource)
    })
  })

  describe('isConfigurableExercise', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.isConfigurableExercise(buildReq(), 'unknown')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter avec ForbiddenResponse sans permission d'écriture", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      permissionService.userPermissionsOnResource.mockResolvedValue(readOnlyPermissions)

      await expect(controller.isConfigurableExercise(buildReq(), 'resource-1')).rejects.toBeInstanceOf(
        ForbiddenResponse
      )
    })

    it('devrait retourner le résultat du service', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      resourceService.isConfigurableExercise.mockResolvedValue(true)

      const result = await controller.isConfigurableExercise(buildReq(), 'resource-1')

      expect(result.resource).toBe(true)
    })
  })

  describe('updateTemplate', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.updateTemplate(buildReq(), 'unknown', 'template-1', 'v1')).rejects.toBeInstanceOf(
        NotFoundResponse
      )
    })

    it("devrait mettre à jour le template et créer le fichier PLO si la ressource ne l'était pas déjà", async () => {
      const existing = buildResource({ templateId: undefined } as never)
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(existing))
      resourceService.update.mockResolvedValue(buildResource({ templateId: 'template-1' } as never))
      const exists = jest.fn().mockResolvedValue(false)
      const touch = jest.fn()
      fileService.repo.mockResolvedValue({ repo: { exists, touch } } as never)

      await controller.updateTemplate(buildReq(), 'resource-1', 'template-1', 'v1')

      expect(dependencyService.updateTemplateDependency).toHaveBeenCalledWith(
        expect.objectContaining({ resourceId: 'resource-1', dependOnId: 'template-1', isTemplate: true })
      )
      expect(touch).toHaveBeenCalled()
    })

    it('ne devrait pas retoucher le fichier PLO si la ressource était déjà un template', async () => {
      const existing = buildResource({ templateId: 'old-template' } as never)
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(existing))
      resourceService.update.mockResolvedValue(buildResource({ templateId: 'template-1' } as never))

      await controller.updateTemplate(buildReq(), 'resource-1', 'template-1', 'v1')

      expect(fileService.repo).not.toHaveBeenCalled()
    })
  })

  describe('removeTemplate', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.removeTemplate(buildReq(), 'unknown')).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it('devrait supprimer le template et sa dépendance', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource()))
      resourceService.deleteTemplate = jest.fn().mockResolvedValue(buildResource())

      await controller.removeTemplate(buildReq(), 'resource-1')

      expect(dependencyService.deleteDependencyForVersion).toHaveBeenCalledWith('resource-1', expect.anything())
    })
  })

  describe('updateCertification', () => {
    it("devrait rejeter avec NotFoundResponse si la ressource n'existe pas", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.empty())

      await expect(controller.updateCertification(buildReq(), 'unknown', true)).rejects.toBeInstanceOf(NotFoundResponse)
    })

    it("devrait rejeter si la ressource n'est pas un exercice", async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.CIRCLE })))

      await expect(controller.updateCertification(buildReq(), 'resource-1', true)).rejects.toBeInstanceOf(
        BadRequestResponse
      )
    })

    it('devrait rejeter pour un non-admin', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.EXERCISE })))

      await expect(
        controller.updateCertification(buildReq({ role: UserRoles.teacher }), 'resource-1', true)
      ).rejects.toBeInstanceOf(ForbiddenResponse)
    })

    it('devrait mettre à jour la certification pour un admin', async () => {
      resourceService.findByIdOrCode.mockResolvedValue(Optional.of(buildResource({ type: ResourceTypes.EXERCISE })))
      resourceService.updateCertification.mockResolvedValue(buildResource({ type: ResourceTypes.EXERCISE }))

      const result = await controller.updateCertification(buildReq({ role: UserRoles.admin }), 'resource-1', true)

      expect(resourceService.updateCertification).toHaveBeenCalledWith('resource-1', true)
      expect(result.resource).toBeDefined()
    })
  })
})
