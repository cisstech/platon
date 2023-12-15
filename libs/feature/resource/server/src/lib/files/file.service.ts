import { Injectable, NotFoundException } from '@nestjs/common'
import { BadRequestResponse, NotFoundResponse, User } from '@platon/core/common'
import {
  ACTIVITY_MAIN_FILE,
  EXERCISE_MAIN_FILE,
  PLCompiler,
  PLReferenceResolver,
  PLSourceFile,
  Variables,
} from '@platon/feature/compiler'
import { LATEST, ResourcePermissions } from '@platon/feature/resource/common'
import path from 'path'
import { ResourcePermissionService } from '../permissions/permissions.service'
import { ResourceEntity } from '../resource.entity'
import { ResourceService } from '../resource.service'
import { Repo } from './repo'

interface CompileInput {
  resourceId: string
  version?: string
  overrides?: Variables
  user?: User
  withAst?: boolean
}

interface CompileOutput {
  source: PLSourceFile
  compiler: PLCompiler
  resource: ResourceEntity
}

interface RepoInfo {
  repo: Repo
  resource: ResourceEntity
  permissions: ResourcePermissions
}

@Injectable()
export class ResourceFileService {
  constructor(
    private readonly resourceService: ResourceService,
    private readonly permissionService: ResourcePermissionService
  ) {}

  /**
   * Gets resource git repository.
   * @param identifier Resource entity|id|code
   * @param user User that manipulates the repository (used for git commits)
   */
  async repo(identifier: string | ResourceEntity, user?: User): Promise<RepoInfo> {
    const resource =
      typeof identifier === 'string'
        ? (await this.resourceService.findByIdOrCode(identifier)).orElseThrow(
            () => new NotFoundResponse(`Resource not found: ${identifier}`)
          )
        : identifier

    const permissions = await this.permissionService.userPermissionsOnResource({ resource, user })

    const directory = {
      ACTIVITY: 'activites',
      CIRCLE: 'circles',
      EXERCISE: 'exercises',
    }[resource.type]

    return {
      repo: await Repo.get(path.join(directory, resource.id), {
        create: true,
        type: resource.type,
        user: user
          ? {
              name: user.username,
              email: user.email,
            }
          : undefined,
      }),
      resource,
      permissions,
    }
  }

  async compile(input: CompileInput): Promise<CompileOutput> {
    const { resourceId, version, user, overrides } = input
    const { repo, resource } = await this.repo(resourceId, user)
    if (resource.type === 'CIRCLE') {
      throw new BadRequestResponse(`Compiler: cannot compile circle`)
    }

    const main = {
      EXERCISE: EXERCISE_MAIN_FILE,
      ACTIVITY: ACTIVITY_MAIN_FILE,
    }[resource.type]

    const [file, content] = await repo.read(main, version)
    if (!content) {
      throw new NotFoundException(`Compiler: missing main file in resource: ${resource.id}`)
    }

    const resolver: PLReferenceResolver = {
      resolveUrl: async (resource, version, path) => {
        const { repo } = await this.repo(resource, user)
        const [file] = await repo.read(path, version || LATEST)
        return file.downloadUrl
      },
      resolveContent: async (resource, version, path) => {
        const { repo } = await this.repo(resource, user)
        const [, content] = await repo.read(path, version || LATEST)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Buffer.from((await content!).buffer).toString()
      },
    }

    const compiler = new PLCompiler({
      resolver,
      resource: resourceId,
      version: file.version,
      main: file.path,
      withAst: input.withAst,
    })

    const textContent = Buffer.from((await content).buffer).toString()

    const source =
      resource.type === 'EXERCISE'
        ? await compiler.compileExercise(textContent, overrides)
        : await compiler.compileActivity(textContent)

    source.variables.author = resource.ownerId
    return { source, resource, compiler }
  }
}
