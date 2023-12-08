import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { DialogService } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { Cas, UpdateCas } from '@platon/feature/cas/common'
import { UiModalDrawerComponent } from '@platon/shared/ui'
import { firstValueFrom } from 'rxjs'
import { CasService } from '../../api/cas.service'
import { Lms } from '@platon/feature/lti/common'

@Component({
  standalone: true,
  selector: 'cas-drawer',
  templateUrl: './cas-drawer.component.html',
  styleUrls: ['./cas-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,

    NzIconModule,
    NzButtonModule,
    NzToolTipModule,

    UiModalDrawerComponent,
  ],
})
export class CasDrawerComponent {
  protected form = this.createForm()
  protected cas?: Cas
  protected members: User[] = []

  @Output() updated = new EventEmitter<Cas>()
  @Input() lmses: Lms[] = []

  @ViewChild(UiModalDrawerComponent, { static: true })
  protected modal!: UiModalDrawerComponent

  constructor(
    private readonly casService: CasService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogService: DialogService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  open(cas: Cas): void {
    this.cas = cas
    this.form = this.createForm()
    this.modal.open()
  }

  protected createForm() {
    return this.formBuilder.group({
      name: [this.cas?.name || '', Validators.required],
      loginURL: [this.cas?.loginURL || '', Validators.required],
      serviceValidateURL: [this.cas?.serviceValidateURL || '', Validators.required],
      version: [this.cas?.version || '3.0', [Validators.required, Validators.pattern(/^(1\.0|2\.0|3\.0|saml1\.1)$/)]],
      lms: [this.cas?.lmses.map((lms: Lms) => lms.id) || '', Validators.required],
    })
  }

  protected async update(): Promise<void> {
    try {
      const cas = await firstValueFrom(this.casService.updateCas(this.cas?.id as string, this.form.value as UpdateCas))
      Object.assign(this.cas as Cas, cas)
      this.updated.emit(cas)
      this.dialogService.success('Les informations ont bien étés mise à jour!')
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la mise à jour du CAS, veuillez réessayer un peu plus tard !'
      )
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
