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
import { Activity, CourseMember } from '@platon/feature/course/common';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { firstValueFrom } from 'rxjs';
import { CourseService } from '../../api/course.service';
import { CourseMemberSelectComponent } from '../course-member-select/course-member-select.component';

@Component({
  standalone: true,
  selector: 'course-activity-settings',
  templateUrl: './activity-settings.component.html',
  styleUrls: ['./activity-settings.component.scss'],
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
    NzPopconfirmModule,

    DialogModule,

    CourseMemberSelectComponent,
  ]
})
export class CourseActivitySettingsComponent implements OnInit {
  @Input() activity!: Activity;
  @Output() activityChange = new EventEmitter<Activity>()

  protected form = new FormGroup({
    openDates: new FormControl<Date[] | undefined>(undefined),
    members: new FormControl<string[] | undefined>(undefined),
    correctors: new FormControl<string[] | undefined>(undefined),
  });

  protected loading = false;
  protected updating = false;
  protected courseMembers: CourseMember[] = [];

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

    const [courseMembers, activityMembers, activityCorrectors] = await Promise.all([
      firstValueFrom(this.courseService.searchMembers(course)),
      firstValueFrom(this.courseService.searchActivityMembers(this.activity)),
      firstValueFrom(this.courseService.searchActivityCorrector(this.activity))
    ]);

    this.courseMembers = courseMembers.resources;

    this.form.patchValue({
      openDates: this.activity.openAt && this.activity.closeAt ? [this.activity.openAt, this.activity.closeAt] : undefined,
      members: activityMembers.resources.map(m => `${m.member.id}${m.user ? ':' + m.user.id : ''}`),
      correctors: activityCorrectors.resources.map(c => `${c.member.id}${c.user ? ':' + c.user.id : ''}`),
    });

    this.loading = false;
    this.changeDetectorRef.markForCheck();
  }

  protected async update(): Promise<void> {
    this.updating = true;
    this.changeDetectorRef.detectChanges();
    try {
      const { value } = this.form;
      await Promise.all([
        firstValueFrom(
          this.courseService.updateActivity(
            this.activity, {
            openAt: value.openDates?.[0] || null,
            closeAt: value.openDates?.[1] || null,
          })
        ),
        firstValueFrom(
          this.courseService.updateActivityMembers(
            this.activity,
            value.members?.map(m => {
              const [memberId, userId] = m.split(':');
              return {
                userId,
                memberId,
              }
            }) || []
          )
        ),
        firstValueFrom(
          this.courseService.updateActivityCorrectors(
            this.activity,
            value.correctors?.map(m => {
              const [memberId, userId] = m.split(':');
              return {
                userId,
                memberId,
              }
            }) || []
          )
        )
      ]);

      this.activityChange.emit(
        this.activity = {
          ...this.activity,
          openAt: value.openDates?.[0],
          closeAt: value.openDates?.[1]
        }
      );

      this.dialogService.success('Activité mise à jour !');
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la mise à jour de l\'activité, veuillez réessayer un peu plus tard !'
      );
    } finally {
      this.updating = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  protected async reload(): Promise<void> {
    this.updating = true;
    this.changeDetectorRef.detectChanges();
    try {
      const activity = await firstValueFrom(
        this.courseService.reloadActivity(
          this.activity
        )
      );

      this.activityChange.emit(
        this.activity = activity
      );

      this.dialogService.success('Activité rechargée !');
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors du rechargement de l\'activité, veuillez réessayer un peu plus tard !'
      );
    } finally {
      this.updating = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  protected async delete(): Promise<void> {
    this.updating = true;
    this.changeDetectorRef.detectChanges();
    try {
      await firstValueFrom(
        this.courseService.deleteActivity(
          this.activity
        )
      );
      this.dialogService.success('Activité supprimée !');
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la suppression de l\'activité, veuillez réessayer un peu plus tard !'
      );
    } finally {
      this.updating = false;
      this.changeDetectorRef.markForCheck();
    }
  }
}
