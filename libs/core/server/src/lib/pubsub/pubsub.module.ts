import { Global, Module } from '@nestjs/common'

import { PubSub } from './pubsub'
import { PubSubService } from './pubsub.service'

@Global()
@Module({
  providers: [PubSub, PubSubService],
  exports: [PubSubService],
})
export class PubSubModule {}
