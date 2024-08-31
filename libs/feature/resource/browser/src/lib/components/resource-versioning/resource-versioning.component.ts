import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core'
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { DialogService } from '@platon/core/browser'
import { UiModalTemplateComponent } from '@platon/shared/ui'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { firstValueFrom } from 'rxjs'
import { ResourceFileService } from '../../api/file.service'
import { Resource } from '@platon/feature/resource/common'

@Component({
  standalone: true,
  selector: 'resource-versioning',
  templateUrl: './resource-versioning.component.html',
  styleUrls: ['./resource-versioning.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NzIconModule,
    NzButtonModule,
    UiModalTemplateComponent,
  ],
})
export class ResourceVersioningComponent implements OnInit {
  private readonly fileService = inject(ResourceFileService)
  private readonly dialogService = inject(DialogService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected visible = false
  protected isOkLoading = false
  protected form = new FormGroup({
    name: new FormControl('', [Validators.required, this.tagValidator()]),
    message: new FormControl('', [Validators.required]),
  })

  @Input() resource!: Resource
  @Output() readonly versionCreated = new EventEmitter<string>()

  protected get controls() {
    return this.form.controls
  }

  async ngOnInit(): Promise<void> {
    this.changeDetectorRef.markForCheck()
  }

  open(): void {
    this.visible = true
    this.changeDetectorRef.markForCheck()
  }

  protected async handleOk(): Promise<void> {
    this.isOkLoading = true

    try {
      const { name, message } = this.form.value
      await firstValueFrom(
        this.fileService.release(this.resource.id, {
          name: name!.trim(),
          message: message!,
        })
      )
      this.visible = false
      this.versionCreated.emit(name!.trim())
      this.form.reset()
      this.dialogService.success('La version a été créée avec succès.')
    } catch {
      this.dialogService.error('Une erreur est survenue lors de la création de la version.')
    } finally {
      this.isOkLoading = false
      this.changeDetectorRef.markForCheck()
    }
  }

  protected handleCancel(): void {
    this.visible = false
    this.form.reset()
  }

  protected tagValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const name = control.value
      if (name != null && name.length > 0) {
        return !/[;\-~^:?[* \r\n]|(\.\.)|(@{)/g.test(name) ? null : { name: true }
      }
      return null
    }
  }
}
