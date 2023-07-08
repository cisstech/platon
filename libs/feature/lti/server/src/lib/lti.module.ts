import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule, UserModule } from '@platon/core/server'
import { LmsUserEntity } from './entities/lms-user.entity'
import { LmsEntity } from './entities/lms.entity'
import { LTIController } from './lti.controller'
import { LTIService } from './lti.service'

@Module({
  imports: [UserModule, AuthModule, TypeOrmModule.forFeature([LmsEntity, LmsUserEntity])],
  controllers: [LTIController],
  providers: [LTIService],
  exports: [LTIService],
})
export class FeatureLtiServerModule {}
