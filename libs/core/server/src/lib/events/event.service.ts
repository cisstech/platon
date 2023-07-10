import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class EventService {
  constructor(private eventEmitter: EventEmitter2) {}

  emit<T>(event: string, payload: T): boolean {
    return this.eventEmitter.emit(event, payload)
  }
}
