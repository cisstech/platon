import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import {
  CreatedResponse,
  CreateLevel,
  CreateTopic,
  ItemResponse,
  Level,
  ListResponse,
  Topic,
  UpdateLevel,
  UpdateTopic,
} from '@platon/core/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { TagProvider } from '../models/tag-provider'

@Injectable()
export class RemoteTagProvider extends TagProvider {
  constructor(private readonly http: HttpClient) {
    super()
  }

  listTopics(): Observable<Topic[]> {
    return this.http
      .get<ListResponse<Topic>>('/api/v1/topics')
      .pipe(map((response) => response.resources))
  }

  createTopic(input: CreateTopic): Observable<Topic> {
    return this.http
      .post<CreatedResponse<Topic>>(`/api/v1/topics`, input)
      .pipe(map((response) => response.resource))
  }

  updateTopic(id: string, input: UpdateTopic): Observable<Topic> {
    return this.http
      .patch<ItemResponse<Topic>>(`/api/v1/topics/${id}`, input)
      .pipe(map((response) => response.resource))
  }

  deleteTopic(topic: Topic): Observable<void> {
    return this.http.delete<void>(`/api/v1/levels/${topic.id}`)
  }

  listLevels(): Observable<Level[]> {
    return this.http
      .get<ListResponse<Level>>('/api/v1/levels/')
      .pipe(map((response) => response.resources))
  }

  createLevel(input: CreateLevel): Observable<Level> {
    return this.http
      .post<CreatedResponse<Topic>>(`/api/v1/levels`, input)
      .pipe(map((response) => response.resource))
  }

  updateLevel(id: string, input: UpdateLevel): Observable<Level> {
    return this.http
      .patch<ItemResponse<Level>>(`/api/v1/levels/${id}`, input)
      .pipe(map((response) => response.resource))
  }

  deleteLevel(level: Level): Observable<void> {
    return this.http.delete<void>(`/api/v1/levels/${level.id}`)
  }
}
