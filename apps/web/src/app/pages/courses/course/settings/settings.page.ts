import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { UiError403Component } from '@platon/shared/ui'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { CourseInformationsPage } from './informations/informations.page'
import { CourseDemoPage } from './demo/demo.page'
import { Subscription } from 'rxjs'
import { CoursePresenter } from '../course.presenter'

@Component({
  standalone: true,
  selector: 'app-course-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzTabsModule, CourseInformationsPage, UiError403Component, CourseDemoPage],
})
export class CourseSettingsPage implements OnInit, OnDestroy {
  private readonly presenter = inject(CoursePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly subscriptions: Subscription[] = []
  protected context = this.presenter.defaultContext()

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
