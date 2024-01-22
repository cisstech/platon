/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { ClipboardService, PickerBrowserService } from '@cisstech/nge/services'
import { NgeUiIconModule } from '@cisstech/nge/ui/icon'
import { DialogModule, DialogService } from '@platon/core/browser'
import { ResourceFile } from '@platon/feature/resource/common'
import { NzContextMenuService, NzDropDownModule, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTreeModule, NzTreeNode } from 'ng-zorro-antd/tree'
import { firstValueFrom } from 'rxjs'
import { ResourceFileService } from '../../api/file.service'

@Component({
  standalone: true,
  selector: 'resource-files',
  templateUrl: './resource-files.component.html',
  styleUrls: ['./resource-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatCardModule,

    NzTreeModule,
    NzEmptyModule,
    NzSpinModule,
    NzDropDownModule,

    DialogModule,
    NgeUiIconModule,
    NgeMarkdownModule,
  ],
})
export class ResourceFilesComponent {
  private readonly fileService = inject(ResourceFileService)
  private readonly pickerService = inject(PickerBrowserService)
  private readonly dialogService = inject(DialogService)
  private readonly clipboardService = inject(ClipboardService)
  private readonly changeDetectionRef = inject(ChangeDetectorRef)
  private readonly nzContextMenuService = inject(NzContextMenuService)

  protected readonly index = new Map<string, ResourceFile>()
  protected selection?: ResourceFile

  protected loading = true
  protected code?: string
  protected version?: string
  protected nodes: Node[] = []
  protected readme?: ResourceFile
  protected root?: ResourceFile

  @Input()
  set tree(value: ResourceFile) {
    this.index.clear()

    const createNode = (entry: ResourceFile): any => {
      this.index.set(entry.path, entry)
      return {
        key: entry.path,
        title: entry.path.split('/').pop(),
        isLeaf: entry.type === 'file',
        children: entry.children?.map(createNode).sort(this.compareNodes),
      }
    }

    this.root = value
    this.nodes = value?.children?.map(createNode)?.sort(this.compareNodes) || []
    this.readme = value.children?.find((file) => file.path.toLowerCase() === 'readme.md')
    this.code = value.resourceCode
    this.version = value.version
    this.loading = false

    this.changeDetectionRef.markForCheck()
  }

  @Output() selected = new EventEmitter<ResourceFile>()
  @Output() afterUpload = new EventEmitter<void>()

  download(target?: ResourceFile): void {
    const file = target ?? this.root
    if (file) {
      window.open(file.downloadUrl)
    }
  }

  async upload(target?: ResourceFile): Promise<void> {
    const folder = target ?? this.root
    if (!folder) {
      return
    }
    const files = await this.pickerService.pickFiles({
      multiple: false,
    })

    if (files.length) {
      await this.dialogService.loading('Importation en cours...', async () => {
        try {
          const file = files[0]
          await firstValueFrom(this.fileService.upload(folder, file))
          this.dialogService.success(`Import terminé avec succès`)
          this.afterUpload.next()
        } catch {
          this.dialogService.error(`Impossible d'importer le fichier`)
        }
      })
    }
  }

  protected contextMenu(event: MouseEvent, menu: NzDropdownMenuComponent, node: NzTreeNode): void {
    this.selection = this.index.get(node.key)
    this.nzContextMenuService.create(event, menu)
  }

  protected copyPath(): void {
    if (this.selection) {
      const { resourceCode, path } = this.selection
      const resource = resourceCode ?? ''
      const version = this.selection.version === 'latest' ? '' : `:${this.selection.version}`
      const prefix = resource + version
      this.clipboardService.copy(`${prefix}${prefix ? '/' : ''}${path}`)
      this.dialogService.success('Le chemin a été copié dans le presse-papiers')
    }
  }

  private compareNodes(a: Node, b: Node): number {
    if ((a.isLeaf && b.isLeaf) || (!a.isLeaf && !b.isLeaf)) {
      return a.title.localeCompare(b.title)
    }
    return a.isLeaf ? 1 : -1
  }
}

interface Node {
  key: string
  title: string
  isLeaf?: boolean
  children?: Node[]
}
