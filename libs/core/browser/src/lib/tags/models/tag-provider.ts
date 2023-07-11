import { CreateLevel, CreateTopic, Level, Topic, UpdateLevel, UpdateTopic } from '@platon/core/common'
import { Observable } from 'rxjs'

export abstract class TagProvider {
  abstract listTopics(): Observable<Topic[]>
  abstract createTopic(input: CreateTopic): Observable<Topic>
  abstract updateTopic(id: string, input: UpdateTopic): Observable<Topic>
  abstract deleteTopic(topic: Topic): Observable<void>

  abstract listLevels(): Observable<Level[]>
  abstract createLevel(input: CreateLevel): Observable<Level>
  abstract updateLevel(id: string, input: UpdateLevel): Observable<Level>
  abstract deleteLevel(level: Level): Observable<void>
}
