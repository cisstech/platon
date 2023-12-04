import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ClipboardService } from '@cisstech/nge/services'
import { DialogService } from '@platon/core/browser'
import { FileVersions } from '@platon/feature/resource/common'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { firstValueFrom } from 'rxjs'
import { ResourceFileService } from '../../api/file.service'
import { ResourceService } from '../../api/resource.service'

@Component({
  standalone: true,
  selector: 'resource-sharing',
  templateUrl: './resource-sharing.component.html',
  styleUrls: ['./resource-sharing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,

    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzButtonModule,
    NzToolTipModule,

    NzModalModule,
  ],
})
export class ResourceSharingComponent implements OnInit {
  private readonly fileService = inject(ResourceFileService)
  private readonly dialogService = inject(DialogService)
  private readonly resourceService = inject(ResourceService)
  private readonly clipboardService = inject(ClipboardService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  @Input() resourceId!: string
  @Input() resourceVersion = 'latest'

  protected versions?: FileVersions
  protected visibility: 'public' | 'private' = 'public'

  async ngOnInit(): Promise<void> {
    const [resource, versions] = await Promise.all([
      firstValueFrom(this.resourceService.find(this.resourceId)),
      firstValueFrom(this.fileService.versions(this.resourceId)),
    ])

    this.versions = versions
    this.visibility = resource.publicPreview ? 'public' : 'private'
    this.changeDetectorRef.markForCheck()
  }

  protected share(): void {
    this.clipboardService.copy(
      `${location.origin}${this.resourceService.previewUrl(this.resourceId, this.resourceVersion)}`
    )
    this.dialogService.success('Lien copié dans le presse-papier')
  }

  protected async changeVisibility(): Promise<void> {
    try {
      await firstValueFrom(
        this.resourceService.update(this.resourceId, {
          publicPreview: this.visibility === 'public',
        })
      )
      this.dialogService.success('Visibilité modifiée')
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
    }
  }
}
