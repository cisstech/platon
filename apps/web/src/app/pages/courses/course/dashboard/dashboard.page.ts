/* eslint-disable @typescript-eslint/no-explicit-any */
import Fuse from 'fuse.js'

import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Subscription, of } from 'rxjs'

import { MatCardModule } from '@angular/material/card'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { NzSegmentedModule } from 'ng-zorro-antd/segmented'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

import { CourseActivityGridComponent, CourseActivityTableComponent } from '@platon/feature/course/browser'
import { Activity, CourseSection } from '@platon/feature/course/common'
import { CourseSectionActionsComponent } from './section-actions/section-actions.component'

import { DurationPipe, SearchBar, UiSearchBarComponent, UiViewModeComponent } from '@platon/shared/ui'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CoursePresenter } from '../course.presenter'

@Component({
  standalone: true,
  selector: 'app-course-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,

    NzIconModule,
    NzGridModule,
    NzEmptyModule,
    NzButtonModule,
    NzToolTipModule,
    NzProgressModule,
    NzCollapseModule,
    NzSegmentedModule,
    NzStatisticModule,
    NzTypographyModule,

    CourseActivityGridComponent,
    CourseActivityTableComponent,
    CourseSectionActionsComponent,

    DurationPipe,
    UiViewModeComponent,
    UiSearchBarComponent,
  ],
})
export class CourseDashboardPage implements OnInit, OnDestroy {
  private readonly presenter = inject(CoursePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly subscriptions: Subscription[] = []

  protected context = this.presenter.defaultContext()
  protected viewModes = [
    {
      icon: 'appstore',
      label: '',
      value: 'cards',
    },
    {
      icon: 'table',
      label: '',
      value: 'table',
    },
  ]

  protected sections: CourseSection[] = []
  protected activities: Activity[] = []

  protected filteredActivities: Activity[] = []
  protected sectionWithActivities: SectionWithActivities[] = []

  protected readonly searchbar: SearchBar<string> = {
    placeholder: `Essayez un nom d'activité, de section...`,
    filterer: {
      run: (query) => {
        const suggestions = new Set<string>([
          ...this.activities.map((activity) => activity.title),
          ...this.sections.map((section) => section.name),
        ])
        return of(
          new Fuse(Array.from(suggestions), {
            includeMatches: true,
            findAllMatches: false,
            threshold: 0.2,
          })
            .search(query)
            .map((e) => e.item)
        )
      },
    },
    onSearch: this.search.bind(this),
  }

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
    this.sectionWithActivities = this.sectionWithActivities.map((item) => {
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
    this.sectionWithActivities = this.sectionWithActivities.map((item) => {
      return {
        ...item,
        activities: item.activities.filter((a) => a.id !== activity.id),
      }
    })
    this.activities = this.activities.filter((a) => a.id !== activity.id)
    this.changeDetectorRef.markForCheck()
  }

  private async refresh(): Promise<void> {
    const [sections, activities] = await Promise.all([this.presenter.listSections(), this.presenter.listActivities()])
    this.sectionWithActivities = sections.map((section) => ({
      section,
      activities: activities.filter((activity) => activity.sectionId === section.id),
    }))

    this.sections = sections
    this.activities = activities

    this.search(this.searchbar.value)

    this.changeDetectorRef.markForCheck()
  }

  private search(query?: string): void {
    const q = query?.trim()
    if (!q) {
      this.filteredActivities = this.activities
      this.sectionWithActivities = this.sections.map((section) => ({
        section,
        activities: this.filteredActivities.filter((activity) => activity.sectionId === section.id),
      }))
      return
    } else {
      this.filteredActivities = this.activities.filter((activity) => {
        const section = this.sections.find((section) => section.id === activity.sectionId)
        return (
          activity.title.toLowerCase().includes(q.toLowerCase()) ||
          (section && section.name.toLowerCase().includes(q.toLowerCase()))
        )
      })
      this.sectionWithActivities = this.sections
        .map((section) => ({
          section,
          activities: this.filteredActivities.filter((activity) => activity.sectionId === section.id),
        }))
        .filter((item) => item.activities.length > 0)
      return
    }
  }
}

interface SectionWithActivities {
  section: CourseSection
  activities: Activity[]
}
