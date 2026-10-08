import { Injectable, inject, signal } from '@angular/core'
import { isTeacherRole } from '@platon/core/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { firstValueFrom } from 'rxjs'
import { Session } from '../core/session/session'
import { ShellApi } from './shell-api'

/**
 * What the cover knows beyond the session: the corrections of the person and, for who creates,
 * the charter and the personal circle. Provided by the shell route. It has no `error` state: what it
 * loads only decorates the frame, so a failure hides what depends on it; the charter then counts as
 * not accepted, so it shows before creating, as in the current interface.
 */
@Injectable()
export class ShellStore {
  private readonly api = inject(ShellApi)
  private readonly session = inject(Session)

  /** Undefined until loaded, and when the summary failed. */
  readonly summaries = signal<ActivityCorrectionSummary[] | undefined>(undefined)
  readonly charterAccepted = signal(false)
  readonly circleId = signal<string | undefined>(undefined)

  load(): void {
    const user = this.session.user()
    if (!user) return
    firstValueFrom(this.api.correctionSummaries())
      .then((summaries) => this.summaries.set(summaries))
      .catch(console.error)
    if (!isTeacherRole(user.role)) return
    firstValueFrom(this.api.charter(user.id))
      .then((charter) => this.charterAccepted.set(charter?.acceptedUserCharter ?? false))
      .catch(console.error)
    firstValueFrom(this.api.personalCircleId(user.username))
      .then((id) => this.circleId.set(id))
      .catch(console.error)
  }

  /** Records the acceptance; true once the API has it. */
  async acceptCharter(): Promise<boolean> {
    const user = this.session.user()
    if (!user) return false
    const charter = await firstValueFrom(this.api.acceptCharter(user.id)).catch((error: unknown) => {
      console.error(error)
      return undefined
    })
    this.charterAccepted.set(charter?.acceptedUserCharter === true)
    return this.charterAccepted()
  }
}
