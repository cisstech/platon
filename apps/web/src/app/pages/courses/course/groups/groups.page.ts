import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { CourseMemberTableComponent } from '@platon/feature/course/browser'
import { CoursePresenter } from '../course.presenter'
import { Subscription } from 'rxjs'
import { NzTypographyModule } from 'ng-zorro-antd/typography'
import { CourseGroupDetail, CourseMember } from '@platon/feature/course/common'
import { CourseMemberSearchModalComponent } from '@platon/feature/course/browser'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CommonModule } from '@angular/common'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'

@Component({
  standalone: true,
  selector: 'app-course-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    NzIconModule,
    NzCollapseModule,
    NzButtonModule,
    NzToolTipModule,
    CourseMemberSearchModalComponent,
    CourseMemberTableComponent,
    NzTypographyModule,
    NzPopconfirmModule,
  ],
})
export class CourseGroupsPage implements OnInit {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(CoursePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected context = this.presenter.defaultContext()

  protected activesGroups: { [key: string]: boolean } = {}

  async ngOnInit() {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe((context) => {
        this.context = context
        this.changeDetectorRef.markForCheck()
      })
    )
    const groups = await this.presenter.listCourseGroups()
    this.context.courseGroups = []
    for (const courseGroup of groups) {
      const members = await this.presenter.listCourseGroupMembers(courseGroup.groupId)
      this.context.courseGroups.push({ courseGroup, members })
      this.activesGroups[courseGroup.groupId] = false
    }
    this.changeDetectorRef.markForCheck()
  }

  protected async updateGroupName(newName: string, groupId: string) {
    await this.presenter.updateGroupName(groupId, newName)
    this.changeDetectorRef.markForCheck()
  }

  protected async removeGroupMember(groupId: string, member: CourseMember) {
    await this.presenter.removeGroupMember(groupId, member)
    this.changeDetectorRef.markForCheck()
  }

  protected async addGroupMember(groupId: string, members: CourseMember[]) {
    await this.presenter.addGroupMember(groupId, members)
    this.changeDetectorRef.markForCheck()
  }

  protected getGroupMembersIds(group: CourseGroupDetail): string[] {
    return group.members.map((m) => m.user?.id ?? '') ?? []
  }

  protected async addGroup() {
    await this.presenter.addGroup()
    this.changeDetectorRef.markForCheck()
  }

  protected async deleteGroup(groupId: string) {
    await this.presenter.deleteGroup(groupId)
    this.changeDetectorRef.markForCheck()
  }

  protected get canEdit(): boolean {
    const { course } = this.context
    if (!course) return false
    return !!course.permissions?.update
  }
}
