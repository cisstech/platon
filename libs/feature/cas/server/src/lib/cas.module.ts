import { Module } from '@nestjs/common'
import { CasController } from './cas.controller'
import { CasService } from './cas.service'
import { AuthModule, UserModule } from '@platon/core/server'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CasEntity } from './entities/cas.entity'
import { FeatureLtiServerModule } from '@platon/feature/lti/server'
import { AxiosService } from './axios.service'

@Module({
  imports: [UserModule, AuthModule, FeatureLtiServerModule, TypeOrmModule.forFeature([CasEntity])],
  controllers: [CasController],
  providers: [CasService, AxiosService],
  exports: [CasService],
})
export class FeatureCasServerModule {}
