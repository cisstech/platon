import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { UiError403Component } from '@platon/shared/ui'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { CourseInformationsPage } from './informations/informations.page'
import { Subscription } from 'rxjs'
import { CoursePresenter } from '../course.presenter'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'

@Component({
  standalone: true,
  selector: 'app-course-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzTabsModule, CourseInformationsPage, UiError403Component],
})
export class CourseSettingsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(CoursePresenter)
  private readonly breakpointObserver = inject(BreakpointObserver)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected context = this.presenter.defaultContext()

  protected get isMobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
