import { Module } from '@nestjs/common'
import { PeerService } from './peer.service'
import { PeerController } from './peer.controller'
import { PeerMatchEntity } from './entities/peerMatch.entity'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PeerGameEntity } from './entities/peerGame.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PeerMatchEntity, PeerGameEntity])],
  controllers: [PeerController],
  providers: [PeerService],
  exports: [PeerService],
})
export class FeaturePeerServerModule {}
