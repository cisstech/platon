import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean } from "class-validator"

export class MemberPermissionsDTO {
  @IsBoolean()
  @ApiProperty()
  read!: boolean

  @IsBoolean()
  @ApiProperty()
  write!: boolean
}
