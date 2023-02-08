import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LevelController } from './level.controller';
import { LevelEntity } from './level.entity';
import { LevelService } from './level.service';

@Module({
  controllers: [LevelController],
  providers: [
    LevelService
  ],
  imports: [
    TypeOrmModule.forFeature([
      LevelEntity
    ])
  ],
  exports: [
    LevelService
  ]
})
export class LevelModule { }
