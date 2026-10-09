import { Injectable, inject } from '@angular/core'
import { UserService } from '@platon/core/browser/shared'
import { UserCharter } from '@platon/core/common'
import { ResourceService } from '@platon/feature/resource/browser/shared'
import { ResultService } from '@platon/feature/result/browser/shared'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { Observable, map } from 'rxjs'

/** What the cover reads from the API. Stateless. */
@Injectable({ providedIn: 'root' })
export class ShellApi {
  private readonly resources = inject(ResourceService)
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

  /** The personal circle of `username`. */
  personalCircleId(username: string): Observable<string> {
    return this.resources.circle(username).pipe(map((circle) => circle.id))
  }
}
