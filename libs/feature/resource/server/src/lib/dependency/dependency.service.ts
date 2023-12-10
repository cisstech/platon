import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ActivityExerciseGroups } from '@platon/feature/compiler'
import { CreateResourceDependency } from '@platon/feature/resource/common'
import { EntityManager, Repository } from 'typeorm'
import { ResourceDependencyEntity } from './dependency.entity'

/**
 * Represents the arguments for creating an activity from an existing activity.
 */
type FromActivityArgs = {
  /**
   * The ID of the activity.
   */
  id: string

  /**
   * The version of the activity.
   */
  version: string

  /**
   * The exercise groups of the activity.
   */
  exerciseGroups: ActivityExerciseGroups

  /**
   * Optional. The entity manager to use for the database operation.
   */
  entityManager?: EntityManager
}

@Injectable()
export class ResourceDependencyService {
  constructor(
    @InjectRepository(ResourceDependencyEntity)
    private readonly repository: Repository<ResourceDependencyEntity>
  ) {}

  /**
   * Upserts a resource dependency.
   * If the dependency already exists, it updates the existing dependency.
   * If the dependency does not exist, it creates a new dependency.
   *
   * @param input - The input data for the resource dependency.
   * @param entityManager - Optional. The entity manager to use for the database operation.
   * @returns A promise that resolves to the upserted resource dependency.
   */
  async upsert(input: CreateResourceDependency, entityManager?: EntityManager): Promise<ResourceDependencyEntity> {
    const { resourceId, dependOnId } = input
    let dependency = entityManager
      ? await entityManager.findOne(ResourceDependencyEntity, {
          where: { resourceId, dependOnId },
        })
      : await this.repository.findOne({ where: { resourceId, dependOnId } })

    if (!dependency) {
      dependency = this.repository.create(input)
    }

    dependency.resourceId = resourceId
    dependency.dependOnId = dependOnId
    dependency.resourceVersion = input.resourceVersion
    dependency.dependOnVersion = input.dependOnVersion

    return entityManager ? await entityManager.save(dependency) : await this.repository.save(dependency)
  }

  /**
   * Deletes a resource dependency.
   *
   * @param resourceId - The ID of the resource.
   * @param dependOnId - The ID of the dependency.
   * @param entityManager - Optional. The entity manager to use for the deletion.
   * @returns A promise that resolves when the deletion is complete.
   */
  async delete(resourceId: string, dependOnId: string, entityManager?: EntityManager): Promise<void> {
    if (entityManager) {
      await entityManager.delete(ResourceDependencyEntity, { resourceId, dependOnId })
    } else {
      await this.repository.delete({ resourceId, dependOnId })
    }
  }

  /**
   * Creates resource dependencies based on the provided activity exercise informations.
   * - If a dependency already exists but is not in the provided exercise groups, it will be deleted.
   * - If a dependency does not exist but is in the provided exercise groups, it will be created.
   * - If a dependency already exists and is in the provided exercise groups, it will be updated.
   *
   * @param args - The arguments for creating dependencies from an activity.
   * @returns A promise that resolves to an array of created dependencies.
   */
  async fromActivity(args: FromActivityArgs) {
    const dependencies = await this.repository.find({
      where: { resourceId: args.id, resourceVersion: args.version },
    })

    const newDependencies = Object.entries(args.exerciseGroups).flatMap(([_, exercises]) =>
      exercises.map((exercise) => ({
        resourceId: args.id,
        resourceVersion: args.version,
        dependOnId: exercise.resource,
        dependOnVersion: exercise.version,
      }))
    )

    // uniquify new dependencies
    const newDependenciesMap = new Map<string, CreateResourceDependency>()
    newDependencies.forEach((dependency) => {
      newDependenciesMap.set(`${dependency.resourceId}:${dependency.dependOnId}`, dependency)
    })

    const dependenciesMap = new Map<string, ResourceDependencyEntity>()
    dependencies.forEach((dependency) => {
      dependenciesMap.set(`${dependency.resourceId}:${dependency.dependOnId}`, dependency)
    })

    const toDelete = dependencies.filter(
      (dependency) => !newDependenciesMap.has(`${dependency.resourceId}:${dependency.dependOnId}`)
    )

    const toCreate = newDependencies.filter(
      (dependency) => !dependenciesMap.has(`${dependency.resourceId}:${dependency.dependOnId}`)
    )

    await Promise.all(
      toDelete.map((dependency) => this.delete(dependency.resourceId, dependency.dependOnId, args.entityManager))
    )

    return await Promise.all(toCreate.map((dependency) => this.upsert(dependency, args.entityManager)))
  }

  /**
   * Retrieves a list of dependencies for a given resource.
   *
   * @remarks
   * - `resource` and `dependOn` relations are populated.
   *
   * @param resourceId - The ID of the resource.
   * @returns A promise that resolves to an array of ResourceDependencyEntity objects.
   */
  listDependencies(resourceId: string): Promise<ResourceDependencyEntity[]> {
    return this.repository.find({
      where: { resourceId },
      relations: { resource: true, dependOn: true },
    })
  }

  /**
   * Retrieves a list of dependents for a given dependOnId.
   *
   * @remarks
   * - `resource` and `dependOn` relations are populated.
   *
   * @param dependOnId - The id of the resource that other resources depend on.
   * @returns A promise that resolves to an array of ResourceDependencyEntity objects representing the dependents.
   */
  listDependents(dependOnId: string): Promise<ResourceDependencyEntity[]> {
    return this.repository.find({
      where: { dependOnId },
      relations: { resource: true, dependOn: true },
    })
  }
}
