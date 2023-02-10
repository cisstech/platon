import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateResourceViewDTO {
  @IsUUID()
  @ApiProperty()
  resourceId!: string
}
