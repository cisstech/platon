import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { DialogModule, DialogService } from '@platon/core/browser'
import { CreateLms, Lms } from '@platon/feature/lti/common'
import { UiModalDrawerComponent } from '@platon/shared/ui'
import { firstValueFrom } from 'rxjs'
import { LTIService } from '../../api/lti.service'

@Component({
  standalone: true,
  selector: 'lms-create-drawer',
  templateUrl: './lms-create-drawer.component.html',
  styleUrls: ['./lms-create-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatFormFieldModule,

    NzIconModule,
    NzButtonModule,
    NzToolTipModule,

    UiModalDrawerComponent,

    DialogModule,
  ],
})
export class LmsCreateDrawerComponent {
  protected form = this.createForm()

  @ViewChild(UiModalDrawerComponent, { static: true })
  protected modal!: UiModalDrawerComponent
  @Output() created = new EventEmitter<Lms>()

  constructor(
    private readonly ltiService: LTIService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  open(): void {
    this.modal.open()
  }

  protected async create(): Promise<void> {
    try {
      const lms = await firstValueFrom(this.ltiService.createLms(this.form.value as CreateLms))
      this.created.emit(lms)
      this.modal.close()
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la création du LMS, veuillez réessayer un peu plus tard !'
      )
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }

  protected createForm() {
    return this.formBuilder.group({
      name: ['', Validators.required],
      url: ['', Validators.required],
      outcomeUrl: ['', Validators.required],
      consumerKey: ['', Validators.required],
      consumerSecret: ['', Validators.required],
    })
  }
}
