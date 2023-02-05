import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LmsUserEntity } from './entities/lms-user.entity';
import { LmsEntity } from './entities/lms.entity';
import { LTIService } from './lti.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LmsEntity,
      LmsUserEntity
    ])
  ],
  controllers: [],
  providers: [LTIService],
  exports: [LTIService],
})
export class FeatureLtiServerModule {}
