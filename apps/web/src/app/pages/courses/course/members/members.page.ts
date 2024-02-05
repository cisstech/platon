import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Subscription } from 'rxjs'

import { MatCardModule } from '@angular/material/card'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { UserSearchModalComponent } from '@platon/core/browser'
import { User, UserGroup, UserRoles } from '@platon/core/common'
import { CourseMemberSearchBarComponent, CourseMemberTableComponent } from '@platon/feature/course/browser'
import { CourseMember, CourseMemberFilters } from '@platon/feature/course/common'

import { FormsModule } from '@angular/forms'
import { CoursePresenter } from '../course.presenter'

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
  protected searchModalTitle = ''
  protected loading = true
  protected filters: CourseMemberFilters = {}
  @Input() roles: (keyof typeof UserRoles)[] = []

  protected get canEdit(): boolean {
    const { course } = this.context
    if (!course) return false
    return !!course.permissions?.update
  }

  protected get allowGroup(): boolean {
    return this.roles.includes(UserRoles.student)
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.changeDetectorRef.markForCheck()
      })
    )

    this.filters = {
      roles: this.roles as UserRoles[],
      limit: 5,
    }

    this.searchModalTitle = this.roles.includes(UserRoles.student) ? 'Ajouter des élèves' : 'Ajouter des enseignants'
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
        })
      })
    )
  }

  protected async remove(member: CourseMember) {
    await this.presenter.deleteMember(member)
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
