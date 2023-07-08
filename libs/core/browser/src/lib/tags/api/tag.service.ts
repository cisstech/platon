import { Injectable } from '@angular/core'
import {
  CreateLevel,
  CreateTopic,
  Level,
  Topic,
  UpdateLevel,
  UpdateTopic,
} from '@platon/core/common'
import { Observable } from 'rxjs'
import { TagProvider } from '../models/tag-provider'

@Injectable({ providedIn: 'root' })
export class TagService {
  constructor(private readonly provider: TagProvider) {}

  listTopics(): Observable<Topic[]> {
    return this.provider.listTopics()
  }

  createTopic(input: CreateTopic): Observable<Topic> {
    return this.provider.createTopic(input)
  }

  updateTopic(id: string, input: UpdateTopic): Observable<Topic> {
    return this.provider.updateTopic(id, input)
  }

  deleteTopic(topic: Topic): Observable<void> {
    return this.provider.deleteTopic(topic)
  }

  listLevels(): Observable<Level[]> {
    return this.provider.listLevels()
  }

  createLevel(input: CreateLevel): Observable<Level> {
    return this.provider.createLevel(input)
  }

  updateLevel(id: string, input: UpdateLevel): Observable<Level> {
    return this.provider.updateLevel(id, input)
  }

  deleteLevel(level: Level): Observable<void> {
    return this.provider.deleteLevel(level)
  }
}
