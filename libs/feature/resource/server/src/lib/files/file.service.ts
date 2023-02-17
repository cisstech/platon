import { Injectable } from '@nestjs/common';
import { NotFoundResponse, User } from '@platon/core/common';
import path from 'path';
import { ResourceEntity } from '../resource.entity';
import { ResourceService } from '../resource.service';
import { Repo } from './repo';

@Injectable()
export class FileService {
  constructor(
    private readonly service: ResourceService
  ) { }
  async repo(resourceId: string, user?: User): Promise<[Repo, ResourceEntity]> {
    const resource = (
      await this.service.findById(resourceId)
    ).orElseThrow(() => new NotFoundResponse(`Resource not found: ${resourceId}`));
    const directory = {
      ACTIVITY: 'activites',
      CIRCLE: 'circles',
      EXERCISE: 'exercises',
    }[resource.type]

    return [
      await Repo.get(path.join(directory, resourceId), {
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
}
