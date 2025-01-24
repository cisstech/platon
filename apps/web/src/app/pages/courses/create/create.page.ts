import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { firstValueFrom } from 'rxjs'

import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { DialogModule, DialogService } from '@platon/core/browser'
import { CourseService } from '@platon/feature/course/browser'
import { UiStepDirective, UiStepperComponent } from '@platon/shared/ui'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'

@Component({
  standalone: true,
  selector: 'app-course-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,

    NzSpinModule,
    NzButtonModule,
    NzSelectModule,
    NzSkeletonModule,
    NzPageHeaderModule,

    UiStepDirective,
    UiStepperComponent,
    DialogModule,
  ],
})
export class CourseCreatePage {
  protected loading = false
  protected creating = false

  protected infos = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl('', [Validators.required]),
  })

  @ViewChild(UiStepperComponent)
  protected stepper!: UiStepperComponent

  @HostListener('window:keydown.meta.enter')
  protected async handleKeyDown(): Promise<void> {
    if (this.stepper.isValid) {
      this.stepper.isLast ? await this.create() : this.stepper.nextStep()
    }
  }

  constructor(
    private readonly router: Router,
    private readonly dialogService: DialogService,
    private readonly courseService: CourseService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  protected async create(): Promise<void> {
    try {
      const infos = this.infos.value
      this.creating = true

      const course = await firstValueFrom(
        this.courseService.create({
          name: infos.name as string,
          desc: infos.desc as string,
        })
      )

      this.router
        .navigate(['/courses', course.id], {
          replaceUrl: true,
        })
        .catch(console.error)
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la création du cours, veuillez réessayer un peu plus tard !'
      )
    } finally {
      this.creating = false
      this.changeDetectorRef.markForCheck()
    }
  }
}
