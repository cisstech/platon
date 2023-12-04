import { Injectable, inject } from '@angular/core'
import { ResultService, UserDashboardModel } from '@platon/feature/result/browser'
import { LayoutState, layoutStateFromError } from '@platon/shared/ui'
import { BehaviorSubject, firstValueFrom } from 'rxjs'

@Injectable()
export class OverviewPresenter {
  private readonly context = new BehaviorSubject<Context>(this.defaultContext())
  private readonly resultService = inject(ResultService)

  readonly contextChange = this.context.asObservable()

  constructor() {
    this.refresh()
  }

  defaultContext(): Context {
    return { state: 'LOADING' }
  }

  private async refresh(): Promise<void> {
    try {
      const dashboard = await firstValueFrom(this.resultService.userDashboard())
      this.updateContext({
        state: 'READY',
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
  dashboard?: UserDashboardModel
}
