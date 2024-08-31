import { ApiProperty } from '@nestjs/swagger'
import { OrderingDirections } from '@platon/core/common'
import { BaseDTO, toNumber } from '@platon/core/server'
import { Cas, CasFilters, CasOrdering, CasVersions, CreateCas, UpdateCas } from '@platon/feature/cas/common'
import { Transform, Type } from 'class-transformer'
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'
import { LmsDTO } from '@platon/feature/lti/server'

export class CasLoginDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly service!: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly ticket!: string
}

export class CasDTO extends BaseDTO implements Cas {
  @IsString()
  readonly name!: string

  @IsString({ message: "L'url de connexion doit être une chaîne de caractères" })
  @IsUrl({ require_tld: false }, { message: "L'url de connexion doit être une url valide" })
  readonly loginURL!: string

  @IsString({ message: "L'url de validation du ticket doit être une chaîne de caractères" })
  @IsUrl({ require_tld: false }, { message: "L'url de validation du ticket doit être une url valide" })
  readonly serviceValidateURL!: string

  @IsEnum(CasVersions)
  readonly version!: CasVersions

  @IsArray()
  @Type(() => LmsDTO)
  readonly lmses!: LmsDTO[]
}

export class CreateCasDTO implements CreateCas {
  @IsString({ message: 'Le nom doit être une chaîne de caractères' })
  readonly name!: string

  @IsString({ message: "L'url de connexion doit être une chaîne de caractères" })
  @IsUrl({ require_tld: false }, { message: "L'url de connexion doit être une url valide" })
  readonly loginURL!: string

  @IsString({ message: "L'url de validation du ticket doit être une chaîne de caractères" })
  @IsUrl({ require_tld: false }, { message: "L'url de validation du ticket doit être une url valide" })
  readonly serviceValidateURL!: string

  @IsEnum(CasVersions, { message: "La version doit être une des valeurs suivantes: '1.0', '2.0', '3.0', 'saml1.1'" })
  readonly version!: CasVersions

  @IsArray()
  @IsString({ each: true })
  readonly lmses: string[] = []
}

export class UpdateCasDTO implements UpdateCas {
  @IsString()
  @IsOptional()
  readonly name?: string

  @IsString({ message: "L'url de connexion doit être une chaîne de caractères" })
  @IsUrl({ require_tld: false }, { message: "L'url de connexion doit être une url valide" })
  readonly loginURL?: string

  @IsString({ message: "L'url de validation du ticket doit être une chaîne de caractères" })
  @IsUrl({ require_tld: false }, { message: "L'url de validation du ticket doit être une url valide" })
  readonly serviceValidateURL?: string

  @IsEnum(CasVersions)
  @IsOptional()
  readonly version!: CasVersions

  @IsArray({ message: 'La liste des LMS doit être un tableau' })
  @IsString({ each: true })
  readonly lmses: string[] = []
}

export class CasFiltersDTO implements CasFilters {
  @IsString()
  @IsOptional()
  readonly search?: string

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly offset?: number

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  readonly limit?: number

  @IsEnum(CasOrdering)
  @IsOptional()
  readonly order?: CasOrdering

  @IsEnum(OrderingDirections)
  @IsOptional()
  readonly direction?: OrderingDirections
}
