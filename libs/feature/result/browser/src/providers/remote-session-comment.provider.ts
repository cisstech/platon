import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ItemResponse, ListResponse } from "@platon/core/common";
import { CreateSessionComment, SessionComment } from "@platon/feature/result/common";
import { Observable, map } from "rxjs";
import { SessionCommentProvider } from "../models/session-comment-provider";

@Injectable()
export class RemoteSessionCommentProvider extends SessionCommentProvider {
  constructor(private readonly http: HttpClient) {
    super();
  }

  list(sessionId: string, answerId: string): Observable<ListResponse<SessionComment>> {
    return this.http.get<ListResponse<SessionComment>>(
      `/api/v1/results/session/${sessionId}/comments/${answerId}`
    );
  }

  create(sessionId: string, answerId: string, input: CreateSessionComment): Observable<SessionComment> {
    return this.http.post<ItemResponse<SessionComment>>(`/api/v1/results/session/${sessionId}/comments/${answerId}`, input).pipe(
      map((response) => response.resource)
    );
  }

  delete(comment: SessionComment): Observable<void> {
    return this.http.delete<void>(
      `/api/v1/results/session/${comment.sessionId}/comments/${comment.answerId}/${comment.id}`
    );
  }

}
