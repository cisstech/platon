import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class LevelDTO {
  @IsUUID()
  @ApiProperty()
  readonly id!: string;

  @IsString()
  @ApiProperty()
  readonly name!: string;

  @IsDate()
  @ApiProperty()
  readonly createdAt!: Date;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  readonly updatedAt?: Date;
}

export class CreateLevelDTO {
  @IsString()
  @ApiProperty()
  readonly name!: string;
}

export class UpdateLevelDTO extends PartialType(CreateLevelDTO) {}
