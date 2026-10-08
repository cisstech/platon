import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { UserService } from '@platon/core/browser/shared'
import { ItemResponse, UserCharter } from '@platon/core/common'
import { ResultService } from '@platon/feature/result/browser/shared'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'

/** What the cover reads from the API. Stateless. */
@Injectable({ providedIn: 'root' })
export class ShellApi {
  private readonly http = inject(HttpClient)
  private readonly results = inject(ResultService)
  private readonly users = inject(UserService)

  correctionSummaries(): Observable<ActivityCorrectionSummary[]> {
    return this.results.listCorrectionSummaries().pipe(map((response) => response.resources))
  }

  charter(userId: string): Observable<UserCharter | undefined> {
    return this.users.findUserCharterById(userId)
  }

  acceptCharter(userId: string): Observable<UserCharter | undefined> {
    return this.users.acceptUserCharter(userId)
  }

  /**
   * The personal circle of `username`. Read directly: the resource library has no light entry, and
   * its provider pulls in the main entry of the core and the notification components.
   */
  personalCircleId(username: string): Observable<string> {
    return this.http
      .get<ItemResponse<{ id: string }>>(`/api/v1/users/${encodeURIComponent(username)}/circle`)
      .pipe(map((response) => response.resource.id))
  }
}
