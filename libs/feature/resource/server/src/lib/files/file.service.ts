import { Injectable, NotFoundException } from '@nestjs/common'
import { BadRequestResponse, NotFoundResponse, User } from '@platon/core/common'
import { PLCompiler, PLReferenceResolver, PLSourceFile, Variables } from '@platon/feature/compiler'
import { ResourcePermissions } from '@platon/feature/resource/common'
import path from 'path'
import { ResourcePermissionService } from '../permissions/permissions.service'
import { ResourceEntity } from '../resource.entity'
import { ResourceService } from '../resource.service'
import { LATEST, Repo } from './repo'

interface CompileInput {
  resourceId: string
  version?: string
  overrides?: Variables
  user?: User
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

  async repo(resourceIdOrCode: string, user?: User): Promise<RepoInfo> {
    const resource = (await this.resourceService.findByIdOrCode(resourceIdOrCode)).orElseThrow(
      () => new NotFoundResponse(`Resource not found: ${resourceIdOrCode}`)
    )
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

  async compile(input: CompileInput): Promise<[PLSourceFile, ResourceEntity]> {
    const { resourceId, version, user, overrides } = input
    const { repo, resource } = await this.repo(resourceId, user)
    if (resource.type === 'CIRCLE') {
      throw new BadRequestResponse(`Compiler: cannot compile circle`)
    }

    const main = {
      EXERCISE: 'main.ple',
      ACTIVITY: 'main.pla',
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
    })

    const textContent = Buffer.from((await content).buffer).toString()

    const source =
      resource.type === 'EXERCISE'
        ? await compiler.compileExercise(textContent, overrides)
        : await compiler.compileActivity(textContent)

    source.variables.author = resource.ownerId
    return [source, resource]
  }
}
