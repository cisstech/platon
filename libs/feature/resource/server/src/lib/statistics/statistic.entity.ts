import { Index, ViewColumn, ViewEntity } from 'typeorm'
/*
SELECT
  resource.id,
  resource.name,
  resource.members,
  resource.watchers,
  resource.events,
  SUM(CASE WHEN resource.id = child.parent_id THEN 1 ELSE 0 END) as children,
  SUM(CASE WHEN child.type = 'CIRCLE' THEN 1 ELSE 0 END) as circles,
  SUM(CASE WHEN child.type = 'ACTIVITY' THEN 1 ELSE 0 END) as activities,
  SUM(CASE WHEN child.type = 'EXERCISE' THEN 1 ELSE 0 END) as exercises,
  SUM(CASE WHEN child.status = 'READY' THEN 1 ELSE 0 END) as ready,
  SUM(CASE WHEN child.status = 'DEPRECATED' THEN 1 ELSE 0 END) as deprecated,
  SUM(CASE WHEN child.status = 'BUGGED' THEN 1 ELSE 0 END) as bugged,
  SUM(CASE WHEN child.status = 'NOT_TESTED' THEN 1 ELSE 0 END) as not_tested,
  SUM(CASE WHEN child.status = 'DRAFT' THEN 1 ELSE 0 END) as draft,
  (
      (
      resource.members +
      resource.watchers +
      resource.events +
      SUM(CASE WHEN resource.id = child.parent_id THEN 1 ELSE 0 END)
    ) * 10 +
      SUM(CASE WHEN child.status = 'READY' THEN 1 ELSE 0 END) * 5 -
      SUM(CASE WHEN child.status = 'BUGGED' THEN 1 ELSE 0 END) * 10 -
      SUM(CASE WHEN child.status = 'DEPRECATED' THEN 1 ELSE 0 END) * 5 -
      SUM(CASE WHEN child.status = 'NOT_TESTED' THEN 1 ELSE 0 END) * 2 -
      SUM(CASE WHEN child.status = 'DRAFT' THEN 1 ELSE 0 END) +
      -- The more recently a resource is updated, the higher its score will be.
        (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM resource.updated_at)) / (60 * 60 * 24)) / 30)
    )
   AS score
FROM (
  SELECT
    resource.id,
    resource.name,
    resource.updated_at,
      COUNT(DISTINCT member.id) as members,
      COUNT(DISTINCT watcher.id) as watchers,
      COUNT(DISTINCT event.id) as events
  FROM "Resources" resource
  LEFT JOIN "ResourceMembers" member ON member.resource_id = resource.id
  LEFT JOIN "ResourceWatchers" watcher ON watcher.resource_id = resource.id
  LEFT JOIN "ResourceEvents" event ON event.resource_id = resource.id
  GROUP BY resource.id
) as resource
LEFT JOIN "Resources" child ON child.parent_id = resource.id
GROUP BY resource.id, resource.name, resource.updated_at, resource.members, resource.watchers, resource.events;

 */

@ViewEntity({
  name: 'ResourceStats',
  materialized: true,
  expression: (dataSource) =>
    dataSource
      .createQueryBuilder()
      .select('resource.id', 'id')
      .addSelect('resource.name', 'name')
      .addSelect('resource.members', 'members')
      .addSelect('resource.watchers', 'watchers')
      .addSelect('resource.events', 'events')

      .addSelect(`SUM(CASE WHEN resource.id = child.parent_id THEN 1 ELSE 0 END)`, 'children')
      .addSelect(`SUM(CASE WHEN child.type = 'CIRCLE' THEN 1 ELSE 0 END)`, 'circles')
      .addSelect(`SUM(CASE WHEN child.type = 'ACTIVITY' THEN 1 ELSE 0 END)`, 'activities')
      .addSelect(`SUM(CASE WHEN child.type = 'EXERCISE' THEN 1 ELSE 0 END)`, 'exercises')

      .addSelect(`SUM(CASE WHEN child.status = 'READY' THEN 1 ELSE 0 END)`, 'ready')
      .addSelect(`SUM(CASE WHEN child.status = 'DEPRECATED' THEN 1 ELSE 0 END)`, 'deprecated')
      .addSelect(`SUM(CASE WHEN child.status = 'BUGGED' THEN 1 ELSE 0 END)`, 'bugged')
      .addSelect(`SUM(CASE WHEN child.status = 'NOT_TESTED' THEN 1 ELSE 0 END)`, 'not_tested')
      .addSelect(`SUM(CASE WHEN child.status = 'DRAFT' THEN 1 ELSE 0 END)`, 'draft')

      .addSelect(
        `
    (
      (
        resource.members +
        resource.watchers +
        resource.events +
        SUM(CASE WHEN resource.id = child.parent_id THEN 1 ELSE 0 END)
      ) * 10 +
        SUM(CASE WHEN child.status = 'READY' THEN 1 ELSE 0 END) * 5 -
        SUM(CASE WHEN child.status = 'BUGGED' THEN 1 ELSE 0 END) * 10 -
        SUM(CASE WHEN child.status = 'DEPRECATED' THEN 1 ELSE 0 END) * 5 -
        SUM(CASE WHEN child.status = 'NOT_TESTED' THEN 1 ELSE 0 END) * 2 -
        SUM(CASE WHEN child.status = 'DRAFT' THEN 1 ELSE 0 END) +
        -- The more recently a resource is updated, the higher its score will be.
          (((EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM resource.updated_at)) / (60 * 60 * 24)) / 30)
      )
    `,
        'score'
      )
      .from(
        (subQuery) =>
          subQuery
            .select('resource.id', 'id')
            .addSelect('resource.name', 'name')
            .addSelect('resource.updated_at', 'updated_at')

            .addSelect('COUNT(DISTINCT member.id)', 'members')
            .addSelect('COUNT(DISTINCT watcher.id)', 'watchers')
            .addSelect('COUNT(DISTINCT event.id)', 'events')

            .from('Resources', 'resource')

            .leftJoin('ResourceMembers', 'member', 'member.resource_id = resource.id')
            .leftJoin('ResourceWatchers', 'watcher', 'watcher.resource_id = resource.id')
            .leftJoin('ResourceEvents', 'event', 'event.resource_id = resource.id')

            .groupBy('resource.id'),
        'resource'
      )
      .leftJoin('Resources', 'child', 'child.parent_id = resource.id')
      .groupBy('resource.id, resource.name, resource.updated_at, resource.members, resource.watchers, resource.events'),
})
export class ResourceStatisticEntity {
  // Common

  /**
   * Unique identifier of the resource.
   */
  @Index()
  @ViewColumn()
  id!: string

  /**
   * Name of the resource.
   */
  @ViewColumn()
  name!: string

  /**
   * Number of members of a resource.
   */
  @ViewColumn()
  members!: number

  /**
   * Number of watchers of the resource.
   */
  @ViewColumn()
  watchers!: number

  /**
   * Number of events in the resource.
   */
  @ViewColumn()
  events!: number

  // Circle Specific

  /**
   * Number of direct subcircles of the circle resource.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  circles!: number

  /**
   * Number of activities in a the circle resource.
   * @remarks
   * - Specific to Circle resources.
   */

  @ViewColumn()
  activities!: number

  /**
   * Number of exercises in the circle resource.
   * @remarks
   * - Specific to Circle resources.
   */

  @ViewColumn()
  exercises!: number

  /**
   * Number of direct children of the circle resource.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  children!: number

  /**
   * Number of child resources with status 'READY'.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  ready!: number

  /**
   * Number of child resources with status 'DEPRECATED'.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  deprecated!: number

  /**
   * Number of child resources with status 'BUGGED'.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  bugged!: number

  /**
   * Number of child resources with status 'NOT_TESTED'.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  not_tested!: number

  /**
   * Number of child resources with status 'DRAFT'.
   * @remarks
   * - Specific to Circle resources.
   */
  @ViewColumn()
  draft!: number

  /**
   * Global score attributed to the resource.
   * @remarks
   * - The more the resource is relevant, the higher its score will be.
   * - This is calculated based on the ponderation of multiple factors such as the frequency of updates, the number of members, watchers...
   */
  @ViewColumn()
  score!: number
}
