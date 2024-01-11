import { Injectable, ViewContainerRef, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { FileService, TaskService } from '@cisstech/nge-ide/core'
import { StorageService } from '@platon/core/browser'
import { removeLeadingSlash } from '@platon/core/common'
import { ResourceService } from '@platon/feature/resource/browser'
import {
  CircleTree,
  LATEST,
  Resource,
  ResourceTypes,
  circleTreeFromResource,
  resourceAncestors,
} from '@platon/feature/resource/common'
import { NzModalService } from 'ng-zorro-antd/modal'
import { firstValueFrom } from 'rxjs'
import {
  ReplaceFolderModalComponent,
  ReplaceFolderModalData,
} from './contributions/explorer/components/replace-folders-modal/replace-folder-modal.component'
import {
  UpdateFoldersModalComponent,
  UpdateFoldersModalData,
} from './contributions/explorer/components/update-folders-modal/update-folders-modal.component'
import { ResourceFileSystemProvider } from './contributions/file-system'

type Ancestor = {
  id: string
  code?: string
  type: ResourceTypes
  version: string
  versions: string[]
}

const ROOT_FOLDERS_PREFIX = 'pl.explorer.root-folders'

@Injectable()
export class EditorPresenter {
  private readonly modalService = inject(NzModalService)
  private readonly storageService = inject(StorageService)
  private readonly resourceService = inject(ResourceService)
  private readonly fileSystemProvider = inject(ResourceFileSystemProvider)

  private viewContainerRef?: ViewContainerRef

  private tree!: CircleTree
  private version!: string
  private resource!: Resource
  private ancestors: Ancestor[] = []
  private ancestorsLength = 0
  private openedAncestorIds: string[] = []

  get currentTree(): Readonly<CircleTree> {
    return this.tree
  }

  get currentVersion(): string {
    return this.version
  }

  get hasAncestors(): boolean {
    return this.ancestorsLength > 0
  }

  get currentResource(): Readonly<Resource> {
    return this.resource
  }

  get currentAncestors(): ReadonlyArray<Readonly<Ancestor>> {
    return this.ancestors
  }

  async init(activatedRoute: ActivatedRoute, viewContainerRef?: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef

    const params = activatedRoute.snapshot.paramMap
    const queryParams = activatedRoute.snapshot.queryParamMap

    const id = params.get('id') as string
    const version = queryParams.get('version') || 'latest'
    const filesToOpen = (queryParams.get('files') || '').split(',').filter(Boolean)

    const [resource, tree] = await Promise.all([
      firstValueFrom(this.resourceService.find({ id })),
      firstValueFrom(this.resourceService.tree()),
    ])

    const personalCircle =
      // If resource is a personal resource belonging to a circle
      resource.personal && resource.type !== ResourceTypes.CIRCLE
        ? await firstValueFrom(this.resourceService.find({ id: resource.parentId! }))
        : resource.personal // If resource is a personal circle
        ? resource
        : undefined

    const resourceIsPersonalExerciseOrActivity = personalCircle && personalCircle.id !== resource.id
    const ancestors = personalCircle
      ? [
          ...(resourceIsPersonalExerciseOrActivity ? [circleTreeFromResource(personalCircle)] : []),
          // root circle
          tree,
        ]
      : resource.type === ResourceTypes.CIRCLE
      ? resourceAncestors(tree, resource.id)
      : resourceAncestors(tree, resource.parentId!, true)

    this.tree = tree
    if (resourceIsPersonalExerciseOrActivity) {
      this.tree.children?.push(circleTreeFromResource(personalCircle))
    }

    this.version = version
    this.resource = resource
    this.ancestors = ancestors.map((ancestor) => ({
      id: ancestor.id,
      code: ancestor.code,
      version: LATEST,
      type: ResourceTypes.CIRCLE,
      versions: ancestor.versions ?? [],
    }))

    this.ancestorsLength = this.ancestors.length

    const openedAncestors = (await firstValueFrom(this.storageService.get(`${ROOT_FOLDERS_PREFIX}.${resource.id}`, [])))
      .map((id) => this.ancestors.find((ancestor) => ancestor.id === id))
      .filter(Boolean) as Ancestor[]

    this.openedAncestorIds = openedAncestors.map((ancestor) => ancestor.id)

    this.fileSystemProvider.setResource(resource)
    return {
      tree,
      version,
      resource,
      // We use function since monaco-editor module is lazy loaded
      rootFolders: () => {
        const folders = [
          {
            name: `${resource.name}#${version}`,
            uri: this.fileSystemProvider.buildUri(resource.id, version),
          },
        ]

        openedAncestors.forEach((ancestor) => {
          folders.push({
            name: `@${ancestor.code}#${version}`,
            uri: this.fileSystemProvider.buildUri(ancestor.code || ancestor.id),
          })
        })

        return folders
      },
      filesToOpen,
    }
  }

  buildUri(resource: string, version?: string, path?: string): monaco.Uri {
    return this.fileSystemProvider.buildUri(resource, version, path)
  }

  findAncestor(uri: monaco.Uri): Ancestor | undefined {
    const [resource] = uri.authority.split(':')
    if (!resource) return
    return this.ancestors.find((ancestor) => ancestor.id === resource || ancestor.code === resource)
  }

  /**
   *  Get the resource thats owns the given uri
   * @param uri the uri to get the owner of
   */
  findOwnerResource(uri: monaco.Uri) {
    const { currentAncestors, currentResource } = this
    const [resource] = uri.authority.split(':')

    const owner =
      currentResource.id === resource
        ? currentResource
        : currentAncestors.find((ancestor) => ancestor.code === resource || ancestor.id === resource)

    return {
      owner: owner
        ? {
            ...owner,
            type: 'type' in owner ? owner.type : ResourceTypes.CIRCLE,
          }
        : undefined,
      opened: currentResource.id === owner?.id,
    }
  }

  /**
   * Resolve the path of the given uri relative to the given resource
   * @remarks
   * - If uri belongs to the current opened resource
   *  - the path will be resolved as a relative path if `to` also belongs to the current resource
   *  - otherwise the path will be resolved as an absolute path
   * - If the resource does not belong to the current opened resource
   *  - the path will be resolved as an absolute path
   *
   * @throws
   *  - If to resource is not a parent of the uri resource of not the same resource
   *
   * @param uri
   * @param to
   * @returns
   */
  resolvePath(uri: monaco.Uri, to: monaco.Uri): string {
    const { owner: srcRes, opened: srcOpened } = this.findOwnerResource(uri)
    if (!srcRes) {
      throw new Error(`Unable to resolve resource linked to : ${uri}`)
    }

    const { owner: dstRes, opened: dstOpened } = this.findOwnerResource(to)
    if (!dstRes) {
      throw new Error(`Unable to resolve resource linked to : ${to}`)
    }

    if (srcOpened && !dstOpened) {
      throw new Error(`Parent resource cannot access child resource files`)
    }

    if (srcOpened && dstOpened) {
      return removeLeadingSlash(uri.path)
    }

    if (!srcOpened && !dstOpened) {
      const indexSrc = this.ancestors.findIndex((ancestor) => ancestor.id === srcRes.id)
      const indexDst = this.ancestors.findIndex((ancestor) => ancestor.id === dstRes.id)
      if (indexSrc < indexDst) {
        throw new Error(`Parent resource cannot access child resource files`)
      }
      if (indexSrc === indexDst) {
        return removeLeadingSlash(uri.path)
      }
    }

    const version = uri.authority.split(':')[1]
    return `/${srcRes.code}:${version}${uri.path}`
  }

  updateRootFolders(fileService: FileService, taskService: TaskService): void {
    const data: UpdateFoldersModalData = {
      selection: [...this.openedAncestorIds],
    }

    this.modalService.create({
      nzContent: UpdateFoldersModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMask: true,
      nzClosable: true,
      nzMaskClosable: true,
      nzTitle: 'Modifier les dossiers racines',
      nzOkText: 'Modifier',
      nzData: data,
      nzOnOk: async () => {
        const task = taskService.run('Mise à jour des dossiers racines...')

        const addedFolders = data.selection
          .filter((id) => !this.openedAncestorIds.includes(id))
          .map((id) => this.ancestors.find((ancestor) => ancestor.id === id))
          .filter(Boolean) as Ancestor[]

        const removedFolders = this.openedAncestorIds
          .filter((id) => !data.selection.includes(id))
          .map((id) => this.ancestors.find((ancestor) => ancestor.id === id))
          .filter(Boolean) as Ancestor[]

        this.openedAncestorIds = data.selection

        fileService.unregisterFolders(
          ...removedFolders.map((ancestor) => this.fileSystemProvider.buildUri(ancestor.code || ancestor.id))
        )

        await fileService.registerFolders(
          ...addedFolders.map((ancestor) => ({
            name: `@${ancestor.code}#${this.version}`,
            uri: this.fileSystemProvider.buildUri(ancestor.code || ancestor.id),
          }))
        )

        await firstValueFrom(
          this.storageService.set(`${ROOT_FOLDERS_PREFIX}.${this.resource.id}`, this.openedAncestorIds)
        )

        task.end()
      },
    })
  }

  replaceFolder(uri: monaco.Uri, fileService: FileService, taskService: TaskService): void {
    const ancestor = this.findAncestor(uri)
    if (!ancestor?.versions.length) {
      throw new Error(`Unable to replace folder ${uri} because it has no versions`)
    }

    if (!ancestor.code) {
      throw new Error(`Unable to replace folder ${uri} because it has no code`)
    }

    const data: ReplaceFolderModalData = {
      selection: ancestor.version,
      versions: ancestor.versions,
      code: ancestor.code,
    }

    this.modalService.create({
      nzContent: ReplaceFolderModalComponent,
      nzViewContainerRef: this.viewContainerRef,
      nzMask: true,
      nzClosable: true,
      nzMaskClosable: true,
      nzTitle: `Ouvrir une autre version de @${ancestor.code}`,
      nzOkText: 'Ouvrir',
      nzData: data,
      nzOnOk: async () => {
        if (data.selection === ancestor.version) {
          return
        }

        const task = taskService.run(`Ouverture de la version ${data.selection} de ${data.code}...`)

        await fileService.replaceFolder(this.fileSystemProvider.buildUri(ancestor.code!, ancestor.version), {
          name: `@${data.code}#${data.selection}`,
          uri: this.fileSystemProvider.buildUri(ancestor.code!, data.selection),
        })

        ancestor.version = data.selection

        task.end()
      },
    })
  }
}
