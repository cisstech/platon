import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'

import { MatIconModule } from '@angular/material/icon'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { AuthService, DialogModule, DialogService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import {
  CourseMemberSelectComponent,
  CourseSearchBarComponent,
  CourseSectionSearchBarComponent,
  CourseService,
} from '@platon/feature/course/browser'
import { Course, CourseMember, CourseSection } from '@platon/feature/course/common'
import { ResourceSearchBarComponent } from '@platon/feature/resource/browser'
import { Resource } from '@platon/feature/resource/common'
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { catchError, firstValueFrom, of } from 'rxjs'

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
    NzRadioModule,
    NzButtonModule,
    NzSelectModule,
    NzSkeletonModule,
    NzDatePickerModule,
    NzPageHeaderModule,

    DialogModule,
    UiStepDirective,
    UiStepperComponent,

    CourseSearchBarComponent,
    CourseMemberSelectComponent,
    CourseSectionSearchBarComponent,

    ResourceSearchBarComponent,
  ],
})
export class ActivityCreatePage implements OnInit {
  private readonly router = inject(Router)
  private readonly authService = inject(AuthService)
  private readonly courseService = inject(CourseService)
  private readonly dialogService = inject(DialogService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected user!: User
  protected loading = false
  protected creating = false
  protected challenge = false
  protected members: CourseMember[] = []

  protected courseInfo = new FormGroup({
    course: new FormControl<Course | undefined>(undefined, [Validators.required]),
    section: new FormControl<CourseSection | undefined>(undefined, [Validators.required]),
  })

  protected resourceInfo = new FormGroup({
    resource: new FormControl<Resource | undefined>(undefined, [Validators.required]),
  })

  protected settingsInfo = new FormGroup({
    members: new FormControl<string[] | undefined>(undefined),
    openDates: new FormControl<Date[] | undefined>(undefined),
    correctors: new FormControl<string[] | undefined>(undefined),
    isChallenge: new FormControl<boolean>(false),
  })

  protected disabledDate = (current: Date): boolean => differenceInCalendarDays(current, new Date()) < 0

  async ngOnInit(): Promise<void> {
    this.loading = true

    this.user = (await this.authService.ready()) as User

    const { queryParamMap } = this.activatedRoute.snapshot

    const courseId = queryParamMap.get('course')
    const sectionId = queryParamMap.get('section')
    this.challenge = !!queryParamMap.get('challenge')
    if (this.challenge) {
      this.settingsInfo.get('isChallenge')?.setValue(true)
    }

    const course = courseId
      ? await firstValueFrom(
          this.courseService
            .find({
              id: courseId,
            })
            .pipe(catchError(() => of(undefined)))
        )
      : undefined

    const section =
      courseId && sectionId
        ? await firstValueFrom(
            this.courseService.findSection(courseId, sectionId).pipe(catchError(() => of(undefined)))
          )
        : undefined

    this.courseInfo.patchValue({ course, section })

    if (course && section) {
      this.courseInfo.disable()
    }

    this.loading = false
    this.changeDetectorRef.markForCheck()
  }

  protected async create(): Promise<void> {
    try {
      this.creating = true
      const { course, section } = this.courseInfo.value
      const { resource } = this.resourceInfo.value
      const { openDates, members, correctors, isChallenge } = this.settingsInfo.value

      const activity = await firstValueFrom(
        this.courseService.createActivity(course as Course, {
          sectionId: section?.id as string,
          resourceId: resource?.id as string,
          resourceVersion: 'latest',
          openAt: (openDates?.[0] || null) as Date,
          closeAt: (openDates?.[1] || null) as Date,
          isChallenge: !!isChallenge,
        })
      )

      if (!isChallenge) {
        await Promise.all([
          firstValueFrom(
            this.courseService.updateActivityMembers(
              activity,
              members?.map((m) => {
                const [memberId, userId] = m.split(':')
                return {
                  userId,
                  memberId,
                }
              }) || []
            )
          ),
          firstValueFrom(
            this.courseService.updateActivityCorrectors(
              activity,
              correctors?.map((m) => {
                const [memberId, userId] = m.split(':')
                return {
                  userId,
                  memberId,
                }
              }) || []
            )
          ),
        ])
      }

      await this.router.navigateByUrl(`/courses/${course?.id}`, { replaceUrl: true })
    } catch {
      this.dialogService.error(
        "Une erreur est survenue lors de la création de l'activité, veuillez réessayer un peu plus tard !"
      )
    } finally {
      this.creating = false
      this.changeDetectorRef.markForCheck()
    }
  }

  protected async loadMembers(): Promise<void> {
    const { course } = this.courseInfo.value
    if (course) {
      const response = await firstValueFrom(this.courseService.searchMembers(course))
      this.members = response.resources
      this.changeDetectorRef.markForCheck()
    }
  }
}
