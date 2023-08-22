import { Global, Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { EventService } from './event.service'

@Global()
@Module({
  imports: [EventEmitterModule.forRoot()],
  exports: [EventEmitterModule, EventService],
  providers: [EventService],
})
export class EventModule {}
