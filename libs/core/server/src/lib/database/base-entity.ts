import {
  CreateDateColumn,
  DeleteQueryBuilder,
  Index,
  ObjectLiteral,
  PrimaryGeneratedColumn,
  SelectQueryBuilder,
  UpdateDateColumn,
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @Index()
  @UpdateDateColumn({ name: 'updated_at' })
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
