/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { ClipboardService } from '@cisstech/nge/services'
import { NgeUiIconModule } from '@cisstech/nge/ui/icon'
import { ResourceFile } from '@platon/feature/resource/common'
import {
  NzContextMenuService,
  NzDropdownMenuComponent,
  NzDropDownModule,
} from 'ng-zorro-antd/dropdown'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTreeModule, NzTreeNode } from 'ng-zorro-antd/tree'

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

    NgeUiIconModule,
    NgeMarkdownModule,
  ],
})
export class ResourceFilesComponent {
  protected readonly index = new Map<string, ResourceFile>()
  protected selection?: ResourceFile

  protected loading = true
  protected code?: string
  protected version?: string
  protected nodes: Node[] = []
  protected readme?: ResourceFile

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

    this.nodes = value?.children?.map(createNode)?.sort(this.compareNodes) || []
    this.readme = value.children?.find((file) => file.path.toLowerCase() === 'readme.md')
    this.code = value.resourceCode
    this.version = value.version
    this.loading = false
    this.changeDetectionRef.markForCheck()
  }

  @Output() selected = new EventEmitter<ResourceFile>()

  constructor(
    private readonly nzMessageService: NzMessageService,
    private readonly clipboardService: ClipboardService,
    private readonly changeDetectionRef: ChangeDetectorRef,
    private readonly nzContextMenuService: NzContextMenuService
  ) {}

  protected contextMenu(event: MouseEvent, menu: NzDropdownMenuComponent, node: NzTreeNode): void {
    this.selection = this.index.get(node.key)
    this.nzContextMenuService.create(event, menu)
  }

  protected copyPath(): void {
    if (this.selection) {
      this.clipboardService.copy(
        `${this.selection.resourceId}/${this.selection.path}?version=${this.selection.version}`
      )
      this.nzMessageService.success('Le chemin a été copié dans le presse-papiers')
    }
  }

  protected download(): void {
    if (this.selection) {
      window.open(this.selection.downloadUrl)
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
