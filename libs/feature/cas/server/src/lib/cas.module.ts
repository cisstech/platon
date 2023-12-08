import { Module } from '@nestjs/common'
import { CasController } from './cas.controller'
import { CasService } from './cas.service'
import { AuthModule, UserModule } from '@platon/core/server'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HttpModule } from '@nestjs/axios'
import { CasEntity } from './entities/cas.entity'
import https from 'https'
import { FeatureLtiServerModule } from '@platon/feature/lti/server'

@Module({
  imports: [
    UserModule,
    AuthModule,
    FeatureLtiServerModule,
    TypeOrmModule.forFeature([CasEntity]),
    HttpModule.register({ httpsAgent: new https.Agent({ rejectUnauthorized: false }) }),
  ],
  controllers: [CasController],
  providers: [CasService],
  exports: [CasService],
})
export class FeatureCasServerModule {}
