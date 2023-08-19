import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { MatIconModule } from '@angular/material/icon'

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'

import { DialogModule } from '@platon/core/browser'
import { UiLayoutTabsComponent, UiLayoutTabDirective } from '@platon/shared/ui'

import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CoursePresenter } from './course.presenter'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'

@Component({
  standalone: true,
  selector: 'app-course',
  templateUrl: './course.page.html',
  styleUrls: ['./course.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CoursePresenter],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatIconModule,

    NzBreadCrumbModule,
    NzTypographyModule,
    NzPageHeaderModule,

    DialogModule,

    UiLayoutTabsComponent,
    UiLayoutTabDirective,
  ],
})
export class CoursePage implements OnInit, OnDestroy {
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

  protected async updateName(name: string) {
    if (name.trim()) {
      await this.presenter.update({ name })
    }
  }

  protected async updateDesc(desc: string) {
    if (desc.trim()) {
      await this.presenter.update({ desc })
    }
  }
}
