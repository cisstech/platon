import {
  CreateDateColumn,
  DeleteQueryBuilder,
  Index,
  ObjectLiteral,
  PrimaryGeneratedColumn,
  SelectQueryBuilder,
  UpdateDateColumn,
  BaseEntity as TypeOrmBaseEntity,
} from 'typeorm'

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt!: Date

  @Index()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt!: Date
}

export type SelectWhereExpression<T extends ObjectLiteral> = (
  queryBuilder: SelectQueryBuilder<T>
) => SelectQueryBuilder<T>

export type DeleteWhereExpression<T extends ObjectLiteral> = (
  queryBuilder: DeleteQueryBuilder<T>
) => DeleteQueryBuilder<T>

export const buildSelectQuery = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  ...expressions: SelectWhereExpression<T>[]
): SelectQueryBuilder<T> => {
  return expressions.reduce((qb, fn) => fn(qb), queryBuilder)
}

export const buildDeleteQuery = <T extends ObjectLiteral>(
  queryBuilder: DeleteQueryBuilder<T>,
  ...expressions: DeleteWhereExpression<T>[]
): DeleteQueryBuilder<T> => {
  return expressions.reduce((qb, fn) => fn(qb), queryBuilder)
}
