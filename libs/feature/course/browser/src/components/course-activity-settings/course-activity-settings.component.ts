import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

import { MatIconModule } from '@angular/material/icon';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { DialogModule, DialogService } from '@platon/core/browser';
import { UserRoles } from '@platon/core/common';
import { CourseActivity, CourseMember } from '@platon/feature/course/common';
import { firstValueFrom } from 'rxjs';
import { CourseService } from '../../api/course.service';
import { CourseMemberTableComponent } from '../member-table/member-table.component';

@Component({
  standalone: true,
  selector: 'course-activity-settings',
  templateUrl: './course-activity-settings.component.html',
  styleUrls: ['./course-activity-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    MatIconModule,

    NzSpinModule,
    NzButtonModule,
    NzSkeletonModule,
    NzDatePickerModule,

    DialogModule,
    CourseMemberTableComponent,
  ]
})
export class CourseActivitySettingsComponent implements OnInit {
  @Input() activity!: CourseActivity;
  @Output() activityChange = new EventEmitter<CourseActivity>()

  protected form = new FormGroup({
    openDates: new FormControl<Date[] | undefined>(undefined),
    members: new FormControl<string[] | undefined>(undefined),
  });

  protected courseMembers: CourseMember[] = [];
  protected loading = false;
  protected updating = false;

  protected disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) < 0;

  constructor(
    private readonly courseService: CourseService,
    private readonly dialogService: DialogService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    const course = await firstValueFrom(
      this.courseService.find(this.activity.courseId),
    );

    const [courseMembers, activityMembers] = await Promise.all([
      firstValueFrom(
        this.courseService.searchMembers(course, { roles: [UserRoles.student] }),
      ),
      firstValueFrom(
        this.courseService.searchMembers(course, { activities: [this.activity.id] }),
      )
    ]);
    this.courseMembers = courseMembers.resources;

    this.form.patchValue({
      openDates: this.activity.openAt && this.activity.closeAt ? [this.activity.openAt, this.activity.closeAt] : undefined,
      members: activityMembers.resources.map(m => m.id)
    });

    this.loading = false;
    this.changeDetectorRef.markForCheck();
  }


  protected async update(): Promise<void> {
    this.updating = true;
    this.changeDetectorRef.detectChanges();
    try {
      const { value } = this.form;
      await firstValueFrom(
        this.courseService.updateActivity(
          this.activity, {
          openAt: value.openDates?.[0] || null,
          closeAt: value.openDates?.[1] || null,
          members: value.members || []
        })
      );

      this.activityChange.emit(
        this.activity = {
          ...this.activity,
          openAt: value.openDates?.[0],
          closeAt: value.openDates?.[1]
        }
      );

      this.dialogService.success('Activité mise à jour !')
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la mise à jour de l\'activité, veuillez réessayer un peu plus tard !'
      );
    } finally {
      this.updating = false;
      this.changeDetectorRef.markForCheck();
    }
  }

}
