import { CreateDateColumn, Index, ObjectLiteral, PrimaryGeneratedColumn, SelectQueryBuilder, UpdateDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Index()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}


type JoinFunction<T extends ObjectLiteral> = (queryBuilder: SelectQueryBuilder<T>) => SelectQueryBuilder<T>;

export const buildQuery = <T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  ...joinFunctions: JoinFunction<T>[]
): SelectQueryBuilder<T> => {
  return joinFunctions.reduce(
    (qb, fn) => fn(qb),
    queryBuilder
  );
}
