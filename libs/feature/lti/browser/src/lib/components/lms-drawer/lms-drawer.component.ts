import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { DialogService, UserSearchBarComponent, UserTableComponent } from '@platon/core/browser'
import { User, UserFilters } from '@platon/core/common'
import { Lms, UpdateLms } from '@platon/feature/lti/common'
import { UiModalDrawerComponent } from '@platon/shared/ui'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { firstValueFrom } from 'rxjs'
import { LTIService } from '../../api/lti.service'

@Component({
  standalone: true,
  selector: 'lms-drawer',
  templateUrl: './lms-drawer.component.html',
  styleUrls: ['./lms-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatFormFieldModule,

    NzIconModule,
    NzTabsModule,
    NzButtonModule,
    NzToolTipModule,

    UserTableComponent,
    UserSearchBarComponent,

    UiModalDrawerComponent,
  ],
})
export class LmsDrawerComponent {
  protected form = this.createForm()
  protected lms?: Lms
  protected members: User[] = []
  protected activeTabIndex = 0
  protected filters: UserFilters = { limit: 10 }
  protected footers: TemplateRef<void>[] = []

  @Output() updated = new EventEmitter<Lms>()

  @ViewChild(UiModalDrawerComponent, { static: true })
  protected modal!: UiModalDrawerComponent

  constructor(
    private readonly ltiService: LTIService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  open(lms: Lms): void {
    this.lms = lms
    this.filters = {
      limit: 10,
      lmses: [lms.id],
    }

    this.form = this.createForm()
    this.modal.open()
  }

  protected createForm() {
    return this.formBuilder.group({
      name: [this.lms?.name || '', Validators.required],
      url: [this.lms?.url || '', Validators.required],
      outcomeUrl: [this.lms?.outcomeUrl || '', Validators.required],
      consumerKey: [this.lms?.consumerKey || '', Validators.required],
      consumerSecret: [this.lms?.consumerSecret || '', Validators.required],
    })
  }

  protected async update(): Promise<void> {
    try {
      const lms = await firstValueFrom(this.ltiService.updateLms(this.lms?.id as string, this.form.value as UpdateLms))
      Object.assign(this.lms as Lms, lms)
      this.updated.emit(lms)
      this.dialogService.success('Les informations ont bien étés mise à jour!')
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la mise à jour du LMS, veuillez réessayer un peu plus tard !'
      )
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
