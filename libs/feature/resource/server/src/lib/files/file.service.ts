import { Injectable, NotFoundException } from '@nestjs/common'
import { BadRequestResponse, NotFoundResponse, User } from '@platon/core/common'
import { PLCompiler, PLReferenceResolver, PLSourceFile } from '@platon/feature/compiler'
import path from 'path'
import { ResourceEntity } from '../resource.entity'
import { ResourceService } from '../resource.service'
import { LATEST, Repo } from './repo'

@Injectable()
export class ResourceFileService {
  constructor(private readonly resourceService: ResourceService) {}

  async repo(resourceIdOrCode: string, user?: User): Promise<[Repo, ResourceEntity]> {
    const resource = (await this.resourceService.findByIdOrCode(resourceIdOrCode)).orElseThrow(
      () => new NotFoundResponse(`Resource not found: ${resourceIdOrCode}`)
    )

    const directory = {
      ACTIVITY: 'activites',
      CIRCLE: 'circles',
      EXERCISE: 'exercises',
    }[resource.type]

    return [
      await Repo.get(path.join(directory, resource.id), {
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
    ]
  }

  async compile(
    resourceId: string,
    version?: string,
    user?: User
  ): Promise<[PLSourceFile, ResourceEntity]> {
    const [repo, resource] = await this.repo(resourceId, user)
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
        const [repo] = await this.repo(resource, user)
        const [file] = await repo.read(path, version || LATEST)
        return file.downloadUrl
      },
      resolveContent: async (resource, version, path) => {
        const [repo] = await this.repo(resource, user)
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

    const source =
      resource.type === 'EXERCISE'
        ? await compiler.compileExercise(Buffer.from((await content).buffer).toString())
        : await compiler.compileActivity(Buffer.from((await content).buffer).toString())

    source.variables.author = resource.ownerId
    return [source, resource]
  }
}
