import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';

import { MatIconModule } from '@angular/material/icon';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { AuthService, DialogModule, DialogService } from '@platon/core/browser';
import { User, UserRoles } from '@platon/core/common';
import { CourseMemberTableComponent, CourseSearchBarComponent, CourseSectionSearchBarComponent, CourseService } from '@platon/feature/course/browser';
import { Course, CourseMember, CourseSection } from '@platon/feature/course/common';
import { ResourceSearchBarComponent } from '@platon/feature/resource/browser';
import { Resource } from '@platon/feature/resource/common';
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui';
import { catchError, firstValueFrom, of } from 'rxjs';


@Component({
  standalone: true,
  selector: 'app-activity-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    MatIconModule,

    NzSpinModule,
    NzButtonModule,
    NzSelectModule,
    NzSkeletonModule,
    NzDatePickerModule,

    DialogModule,
    UiStepDirective,
    UiStepperComponent,

    CourseSearchBarComponent,
    CourseMemberTableComponent,
    CourseSectionSearchBarComponent,
    ResourceSearchBarComponent,
  ]
})
export class ActivityCreatePage implements OnInit {
  protected user!: User;
  protected loading = false;
  protected creating = false;
  protected members: CourseMember[] = [];

  protected courseInfo = new FormGroup({
    course: new FormControl<Course | undefined>(undefined, [Validators.required]),
    section: new FormControl<CourseSection | undefined>(undefined, [Validators.required]),
  });

  protected resourceInfo = new FormGroup({
    resource: new FormControl<Resource | undefined>(undefined, [Validators.required]),
  });

  protected settingsInfo = new FormGroup({
    openDates: new FormControl<Date[] | undefined>(undefined),
    members: new FormControl<string[] | undefined>(undefined),
  });

  protected disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) < 0;


  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly courseService: CourseService,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    this.loading = true;

    this.user = await this.authService.ready() as User;

    const { queryParamMap } = this.activatedRoute.snapshot;

    const courseId = queryParamMap.get('course');
    const sectionId = queryParamMap.get('section');

    const course = courseId ? await firstValueFrom(
      this.courseService.find(courseId).pipe(
        catchError(() => of(undefined))
      )
    ) : undefined;

    const section = courseId && sectionId ? await firstValueFrom(
      this.courseService.findSection(courseId, sectionId).pipe(
        catchError(() => of(undefined))
      )
    ) : undefined;

    this.courseInfo.patchValue({ course, section });

    if (course && section) {
      this.courseInfo.disable();
    }

    this.loading = false;
    this.changeDetectorRef.markForCheck();
  }

  protected async create(): Promise<void> {
    try {
      this.creating = true;
      const { course, section } = this.courseInfo.value;
      const { resource } = this.resourceInfo.value;
      const { openDates, members } = this.settingsInfo.value;
      await firstValueFrom(
        this.courseService.createActivity(course as Course, {
          sectionId: section?.id as string,
          resourceId: resource?.id as string,
          resourceVersion: 'latest',
          openAt: (openDates?.[0] || null) as Date,
          closeAt: (openDates?.[1] || null) as Date,
          members: members as string[]
        })
      );
      await this.router.navigateByUrl(`/courses/${course?.id}`, {
        replaceUrl: true
      });
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la création de l\'activité, veuillez réessayer un peu plus tard !'
      );
    } finally {
      this.creating = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  protected async loadMembers(): Promise<void> {
    const { course } = this.courseInfo.value;
    if (course) {
      const response = await firstValueFrom(
        this.courseService.searchMembers(course, { roles: [UserRoles.student] })
      );
      this.members = response.resources;
      this.changeDetectorRef.markForCheck();
    }
  }
}
