import { Injectable, inject } from '@angular/core'
import { AuthService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { ResultService, UserDashboardModel } from '@platon/feature/result/browser'
import { LayoutState, layoutStateFromError } from '@platon/shared/ui'
import { BehaviorSubject, firstValueFrom } from 'rxjs'

@Injectable()
export class OverviewPresenter {
  private readonly context = new BehaviorSubject<Context>(this.defaultContext())
  private readonly resultService = inject(ResultService)
  private readonly authService = inject(AuthService)

  readonly contextChange = this.context.asObservable()

  constructor() {
    this.refresh().catch(console.error)
  }

  defaultContext(): Context {
    return { state: 'LOADING' }
  }

  private async refresh(): Promise<void> {
    try {
      const [user, dashboard] = await Promise.all([
        this.authService.ready(),
        firstValueFrom(this.resultService.userDashboard()),
      ])

      this.updateContext({
        state: 'READY',
        user,
        dashboard,
      })
    } catch (error) {
      this.updateContext({ state: layoutStateFromError(error) })
    }
  }

  private updateContext(context: Partial<Context>): void {
    const newContext = {
      ...this.context.value,
      ...context,
    }
    this.context.next(newContext)
  }
}

export interface Context {
  state: LayoutState
  user?: User
  dashboard?: UserDashboardModel
}
