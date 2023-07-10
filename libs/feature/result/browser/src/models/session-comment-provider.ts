import { ListResponse } from '@platon/core/common'
import { CreateSessionComment, SessionComment } from '@platon/feature/result/common'
import { Observable } from 'rxjs'

export abstract class SessionCommentProvider {
  abstract list(sessionId: string, answerId: string): Observable<ListResponse<SessionComment>>
  abstract create(
    sessionId: string,
    answerId: string,
    input: CreateSessionComment
  ): Observable<SessionComment>
  abstract delete(comment: SessionComment): Observable<void>
}
