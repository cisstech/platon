import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestResponse, NotFoundResponse, User } from '@platon/core/common';
import { PLCompiler, PLParser } from '@platon/feature/compiler';
import path from 'path';
import { ResourceEntity } from '../resource.entity';
import { ResourceService } from '../resource.service';
import { LATEST, Repo } from './repo';

@Injectable()
export class ResourceFileService {
  constructor(
    private readonly resourceService: ResourceService
  ) { }

  async repo(resourceIdOrCode: string, user?: User): Promise<[Repo, ResourceEntity]> {
    const resource = (
      await this.resourceService.findByIdOrCode(resourceIdOrCode)
    ).orElseThrow(() => new NotFoundResponse(`Resource not found: ${resourceIdOrCode}`));

    const directory = {
      ACTIVITY: 'activites',
      CIRCLE: 'circles',
      EXERCISE: 'exercises',
    }[resource.type]

    return [
      await Repo.get(path.join(directory, resource.id), {
        create: true,
        type: resource.type,
        user: user ? {
          name: user.username,
          email: user.email
        } : undefined
      }),
      resource
    ];
  }

  async compile(resourceId: string, version?: string, user?: User) {
    const [repo, resource] = await this.repo(resourceId, user);
    if (resource.type === 'CIRCLE')
      throw new BadRequestResponse(`Compiler: cannot compile circle resource`);

    const main = {
      EXERCISE: 'main.ple',
      ACTIVITY: 'main.pla',
    }[resource.type];

    const [mainfile, source] = await repo.read(main, version);
    if (!source) {
      throw new NotFoundException('Compiler: missing main file')
    }

    const statements = new PLParser().parse(Buffer.from((await source).buffer).toString());

    const compiler = new PLCompiler({
      type: resource.type === 'EXERCISE' ? 'exercise' : 'activity',
      resource: resourceId,
      filepath: mainfile.path,
      version: mainfile.version,
      resolver: {
        resolveUrl: async (resource, version, path) => {
          const [repo] = await this.repo(resource, user);
          const [file] = await repo.read(path, version || LATEST);
          return file.downloadUrl;
        },
        resolveContent: async (resource, version, path) => {
          const [repo] = await this.repo(resource, user);
          const [, content] = await repo.read(path, version || LATEST);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return Buffer.from((await content!).buffer).toString()
        },
      }
    });

    return await compiler.visit(statements);
  }
}
