import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';

import { CourseMemberFormComponent, CourseMemberTableComponent } from '@platon/feature/course/browser';
import { CoursePresenter } from '../course.presenter';
import { CourseMember, CreateCourseMember } from '@platon/feature/course/common';
import { UserRoles } from '@platon/core/common';


@Component({
  standalone: true,
  selector: 'app-course-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatCardModule,

    CourseMemberFormComponent,
    CourseMemberTableComponent,
  ]
})
export class CourseMembersPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  protected context = this.presenter.defaultContext();

  protected members: CourseMember[] = [];
  protected excludes: string[] = [];
  protected nonDeletables: string[] = [];

  @Input() roles: (UserRoles | keyof typeof UserRoles)[] = [];

  protected get canEdit(): boolean {
    const { user } = this.context;
    if (!user)
      return false;
    return [UserRoles.admin, UserRoles.teacher].includes(user.role);
  }

  protected get allowGroup(): boolean {
    return this.roles.includes(UserRoles.student);
  }

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        this.refresh();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected async add(input: CreateCourseMember) {
    await this.presenter.addMember(input);
    await this.refresh();
  }

  protected async remove(member: CourseMember) {
    await this.presenter.deleteMember(member);
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const { course } = this.context;
    if (course) {
      this.nonDeletables = [course.ownerId];
      const response = await this.presenter.searchMembers({
        roles: [UserRoles.teacher, UserRoles.admin]
      });

      this.members = response.resources;
      this.excludes = [];

      this.members.forEach(member => {
        if (member.userId) {
          this.excludes.push(member.userId);
        }
        if (member.group) {
          this.excludes.push(member.group.id);
        }
      });

      this.members = Array.from(
        new Set(this.members)
      );
    }

    this.changeDetectorRef.markForCheck();
  }
}
