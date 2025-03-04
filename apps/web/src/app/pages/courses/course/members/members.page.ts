import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Subscription } from 'rxjs'

import { MatCardModule } from '@angular/material/card'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { UserSearchModalComponent } from '@platon/core/browser'
import { User, UserGroup } from '@platon/core/common'
import {
  ChangeRoleEvent,
  CourseMemberSearchBarComponent,
  CourseMemberTableComponent,
  CoursePipesModule,
} from '@platon/feature/course/browser'
import { CourseMember, CourseMemberFilters } from '@platon/feature/course/common'
import { CourseMemberRoles } from '@platon/feature/course/common'

import { FormsModule } from '@angular/forms'
import { CoursePresenter } from '../course.presenter'
import { NzSelectModule } from 'ng-zorro-antd/select'

@Component({
  standalone: true,
  selector: 'app-course-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,

    NzIconModule,
    NzButtonModule,
    NzToolTipModule,
    NzSelectModule,

    CoursePipesModule,
    UserSearchModalComponent,
    CourseMemberTableComponent,
    CourseMemberSearchBarComponent,
  ],
})
export class CourseMembersPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(CoursePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected context = this.presenter.defaultContext()
  protected members: CourseMember[] = []
  protected excludes: string[] = []
  protected nonDeletables: string[] = []
  protected searchModalTitle = 'Ajouter un membre'
  protected loading = true
  protected filters: CourseMemberFilters = {}
  @Input() roles: (keyof typeof CourseMemberRoles)[] = []
  protected role: CourseMemberRoles = CourseMemberRoles.student

  protected get canEdit(): boolean {
    const { course } = this.context
    if (!course) return false
    return !!course.permissions?.update
  }

  protected get allowGroup(): boolean {
    return this.roles.includes(CourseMemberRoles.student)
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.changeDetectorRef.markForCheck()
      })
    )

    this.filters = {
      roles: this.roles as CourseMemberRoles[],
      limit: 5,
    }

    this.roles = this.roles.length ? this.roles : [CourseMemberRoles.student, CourseMemberRoles.teacher]

    if (this.roles.length > 1) {
      this.searchModalTitle = 'Ajouter des membres'
    } else {
      if (this.roles.includes(CourseMemberRoles.student)) {
        this.searchModalTitle = 'Ajouter des élèves'
      } else {
        if (this.roles.includes(CourseMemberRoles.teacher)) {
          this.searchModalTitle = 'Ajouter des enseignants'
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async addMembers(userOrGroups: (User | UserGroup)[]) {
    await Promise.all(
      userOrGroups.map(async (userOrGroup) => {
        return this.presenter.addMember({
          id: userOrGroup.id,
          isGroup: !('username' in userOrGroup),
          role: this.role,
        })
      })
    )
  }

  protected async remove(member: CourseMember) {
    await this.presenter.deleteMember(member)
  }

  protected async updateRole(event: ChangeRoleEvent) {
    const { member, newRole, previousRole } = event
    try {
      await this.presenter.updateMemberRole(member, newRole)
    } catch (error) {
      const updatedMember = { ...member, role: previousRole }
      this.members = this.members.map((m) => (m.id === member.id ? updatedMember : m))
      this.changeDetectorRef.markForCheck()
    }
  }

  protected async onUpdateMembers(members: CourseMember[]): Promise<void> {
    const { course } = this.context
    if (!course) return

    this.excludes = []
    this.nonDeletables = [course.ownerId]

    members.forEach((member) => {
      if (member.user) {
        this.excludes.push(member.user.id)
      }
      if (member.group) {
        this.excludes.push(member.group.id)
      }
    })

    this.members = members
    this.changeDetectorRef.markForCheck()
  }
}
