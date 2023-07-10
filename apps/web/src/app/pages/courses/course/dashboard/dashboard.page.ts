/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

import { CourseActivityGridComponent } from '@platon/feature/course/browser'
import { Activity, CourseSection } from '@platon/feature/course/common'
import { CoursePresenter } from '../course.presenter'
import { CourseSectionActionsComponent } from './section-actions/section-actions.component'

@Component({
  standalone: true,
  selector: 'app-course-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    NzIconModule,
    NzEmptyModule,
    NzButtonModule,
    NzCollapseModule,
    NzTypographyModule,

    CourseActivityGridComponent,
    CourseSectionActionsComponent,
  ],
})
export class CourseDashboardPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  protected context = this.presenter.defaultContext()

  protected sections: SectionWithActivities[] = []

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        await this.refresh()
      }),
      this.presenter.onDeletedActivity.subscribe((activity) => {
        this.onDeleteActivity(activity)
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async addSection(after?: CourseSection): Promise<void> {
    await this.presenter.addSection({
      name: 'Modifiez le titre de votre section',
      order: after ? after.order + 1 : 0,
    })
    await this.refresh()
  }

  protected async renameSection(section: CourseSection, newName: string): Promise<void> {
    await this.presenter.updateSection(section, { name: newName })
    this.sections = this.sections.map((item) => {
      if (item.section.id === section.id) {
        return {
          ...item,
          section: {
            ...item.section,
            name: newName,
          },
        }
      }
      return item
    })
    this.changeDetectorRef.markForCheck()
  }

  protected async moveUpSection(section: CourseSection): Promise<void> {
    await this.presenter.updateSection(section, { order: section.order - 1 })
    await this.refresh()
  }

  protected async moveDownSection(section: CourseSection): Promise<void> {
    await this.presenter.updateSection(section, { order: section.order + 1 })
    await this.refresh()
  }

  protected async deleteSection(section: CourseSection): Promise<void> {
    await this.presenter.deleteSection(section)
    await this.refresh()
  }

  protected trackSection(_: number, item: SectionWithActivities): string {
    return item.section.id
  }

  protected onDeleteActivity(activity: Activity): void {
    this.sections = this.sections.map((item) => {
      return {
        ...item,
        activities: item.activities.filter((a) => a.id !== activity.id),
      }
    })
    this.changeDetectorRef.markForCheck()
  }

  private async refresh(): Promise<void> {
    const [sections, activities] = await Promise.all([
      this.presenter.listSections(),
      this.presenter.listActivities(),
    ])

    this.sections = sections.map((section) => ({
      section,
      activities: activities.filter((activity) => activity.sectionId === section.id),
    }))

    this.changeDetectorRef.markForCheck()
  }
}

interface SectionWithActivities {
  section: CourseSection
  activities: Activity[]
}
