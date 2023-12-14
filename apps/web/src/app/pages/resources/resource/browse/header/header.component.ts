import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core'
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { RouterModule } from '@angular/router'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzModalModule } from 'ng-zorro-antd/modal'

import { FileVersions, Resource } from '@platon/feature/resource/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ResourcePresenter } from '../../resource.presenter'

@Component({
  standalone: true,
  selector: 'app-resource-browse-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzButtonModule,
    NzToolTipModule,
    NzModalModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class ResourceBrowseHeaderComponent {
  private readonly resourcePresenter = inject(ResourcePresenter)
  @Input() version = 'latest'
  @Input() versions: FileVersions = { all: [] }
  @Input() resource!: Resource
  @Input() canPreview = true
  @Output() edit = new EventEmitter<void>()
  @Output() preview = new EventEmitter<void>()
  @Output() refresh = new EventEmitter<string>()

  isVisible = false
  isOkLoading = false
  isConfirmLoading = false

  protected tagForm = new FormGroup({
    tag: new FormControl('', [Validators.required, this.createTagValidator()]),
    desc: new FormControl('', [Validators.required]),
  })

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  showModal(): void {
    this.isVisible = true
  }

  async handleOk(): Promise<void> {
    this.isOkLoading = true

    const success = await this.resourcePresenter.createTag(
      this.tagForm.value.tag as Required<string>,
      this.tagForm.value.desc as Required<string>
    )

    if (success) {
      this.isVisible = false
      this.isOkLoading = false
      this.tagForm.reset()
    } else {
      this.isOkLoading = false
    }
    this.changeDetectorRef.markForCheck()
  }

  handleCancel(): void {
    this.isVisible = false
    this.tagForm.reset()
  }

  createTagValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tag: string = control.value

      if (tag != null && tag.length > 0) {
        const isTagValid = !/[;\-~^:?[* \r\n]|(\.\.)|(@{)/g.test(tag)

        return isTagValid ? null : { tag: true }
      }

      return null
    }
  }

  getErrorDesc() {
    return this.tagForm.controls.desc.hasError('required') ? 'Vous devez saisir une description.' : ''
  }

  getErrorTag() {
    if (this.tagForm.controls.tag.hasError('required')) {
      return 'Vous devez saisir un nom de tag.'
    }

    return this.tagForm.controls.tag.hasError('tag') ? "Ce nom de tag n'est pas valide." : ''
  }
}
