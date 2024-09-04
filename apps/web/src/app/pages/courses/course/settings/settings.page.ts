import { CommonModule, DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core'
import { UiError403Component } from '@platon/shared/ui'
import { Subscription } from 'rxjs'
import { CoursePresenter } from '../course.presenter'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { UserRoles } from '@platon/core/common'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { Clipboard } from '@angular/cdk/clipboard'
import { MatCardModule } from '@angular/material/card'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { Router } from '@angular/router'

@Component({
  standalone: true,
  selector: 'app-course-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    UiError403Component,
    ReactiveFormsModule,

    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatCardModule,

    NzFormModule,
    NzSpinModule,
    NzButtonModule,
    NzSelectModule,
    NzInputModule,
    NzIconModule,
    NzPopconfirmModule,
  ],
})
export class CourseSettingsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly breakpointObserver = inject(BreakpointObserver)
  private readonly router = inject(Router)

  protected context = this.presenter.defaultContext()

  protected get isMobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])
  }

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl('', [Validators.required]),
  })

  protected courseId = ''
  protected demoUri = ''
  protected hasDemo = false
  protected saving = false

  protected get canEdit(): boolean {
    const { user } = this.context
    if (!user) return false
    return user.role === UserRoles.teacher || user.role === UserRoles.admin
  }

  protected get canSubmit(): boolean {
    const { user } = this.context
    if (!user) return false
    return this.form.valid && this.canEdit
  }

  constructor(
    private readonly presenter: CoursePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly clipboard: Clipboard,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        const { course, demo } = context
        if (course) {
          this.courseId = course.id
          this.form = new FormGroup({
            name: new FormControl({ value: course.name, disabled: !this.canEdit }, [Validators.required]),
            desc: new FormControl({ value: course.desc || '', disabled: !this.canEdit }, [Validators.required]),
          })
        }
        if (!!demo && demo.isPresent()) {
          this.hasDemo = true
          this.demoUri = this.document.location.hostname + '/demo/' + demo.get().uri
        } else {
          this.hasDemo = false
          this.demoUri = ''
        }
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async saveChanges(): Promise<void> {
    try {
      this.saving = true
      const { value } = this.form
      await this.presenter.update({
        name: value.name as string,
        desc: value.desc as string,
      })
    } finally {
      this.saving = false
      this.changeDetectorRef.markForCheck()
    }
  }

  protected trackByValue(_: number, item: unknown): unknown {
    return item
  }

  async createDemo() {
    try {
      this.saving = true
      await this.presenter.createDemo()
    } finally {
      this.saving = false
      this.changeDetectorRef.markForCheck()
      this.clipboard.copy(this.demoUri)
    }
  }

  async deleteDemo() {
    try {
      this.saving = true
      await this.presenter.deleteDemo()
    } finally {
      this.saving = false
      this.changeDetectorRef.markForCheck()
    }
  }

  async copyUri() {
    this.clipboard.copy(this.demoUri)
    await this.presenter.copyDemoUri()
  }

  async deleteCourse() {
    await this.presenter.delete()
    await this.router.navigate(['/courses'])
  }
}
