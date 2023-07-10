import GraphQLJSON from 'graphql-type-json'

import { Field, InputType, Int, ObjectType } from '@nestjs/graphql'
import { BaseGraphModel, toBoolean, toNumber } from '@platon/core/server'
import { Notification, NotificationFilters } from '@platon/feature/notification/common'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNumber, IsOptional } from 'class-validator'
import { NotificationEntity } from './notification.entity'

@ObjectType('Notification')
export class NotificationGraphModel extends BaseGraphModel implements Notification {
  constructor(data: Partial<NotificationEntity>) {
    super()
    Object.assign(this, data)
  }

  @Field({ nullable: true })
  readAt?: Date

  @Field(() => GraphQLJSON)
  data!: Record<string, unknown>

  userId!: string
}

@ObjectType('NotificationChange')
export class NotificationChangeGraphModel {
  constructor(data: Partial<NotificationChangeGraphModel>) {
    Object.assign(this, data)
  }

  @Field()
  unreadCount!: number

  @Field(() => NotificationGraphModel, { nullable: true })
  newNotification?: NotificationGraphModel
}

@InputType('NotificationFiltersInput')
export class NotificationFiltersInput implements NotificationFilters {
  @Field(() => Boolean, { nullable: true })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  readonly unread?: boolean

  @Field(() => Int, { nullable: true })
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number

  @Field(() => Int, { nullable: true })
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number
}
