/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Editor, OpenRequest } from '@cisstech/nge-ide/core'
import { Subscription, firstValueFrom } from 'rxjs'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { ResourceFileImpl } from '../../file-system'
import { NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree'
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown'
import { ExplorerService } from '@cisstech/nge-ide/explorer'

@Component({
  selector: 'app-zip-editor',
  templateUrl: './zip-editor.component.html',
  styleUrls: ['./zip-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZipEditorComponent implements OnInit, OnDestroy {
  private readonly resourceFileService = inject(ResourceFileService)
  private readonly subscriptions: Subscription[] = []
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly explorerService = inject(ExplorerService)

  protected nodes: NzTreeNodeOptions[] = []
  protected fileName = ''
  protected resourceFile: ResourceFileImpl | null = null

  @Input()
  protected editor!: Editor
  protected request!: OpenRequest

  constructor(private nzContextMenuService: NzContextMenuService) {}

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.createEditor().catch(console.error)
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  buildNzTree(paths: string[]): NzTreeNodeOptions[] {
    const root: NzTreeNodeOptions[] = []

    const addNode = (parts: string[], node: NzTreeNodeOptions[], fullPath: string) => {
      const part = parts.shift()
      if (!part) return

      let childNode = node.find((child) => child.title === part)

      if (!childNode) {
        childNode = {
          title: part,
          key: fullPath,
          children: [],
          selectable: false,
        }

        node.push(childNode)
      }

      childNode.isLeaf = false
      if (parts.length === 0) {
        childNode.isLeaf = true
      } else {
        addNode(parts, childNode.children!, fullPath)
      }
    }

    paths.forEach((path) => {
      const parts = path.split('/').filter(Boolean)
      addNode(parts, root, path)
    })

    return root
  }

  createEditor = async (): Promise<void> => {
    const file = this.request.file! as ResourceFileImpl
    this.fileName = file.resourceFile.path
    this.resourceFile = file
    const files = await firstValueFrom(this.resourceFileService.listZipFiles(this.resourceFile.resourceFile))
    this.nodes = this.buildNzTree(files)
    this.changeDetectorRef.markForCheck()
  }

  openFolder(event: NzFormatEmitEvent): void {
    const node = event.node
    if (node) {
      node.isExpanded = !node.isExpanded
    }
  }

  contextMenu($event: Event, menu: NzDropdownMenuComponent): void {
    this.nzContextMenuService.create($event as MouseEvent, menu)
  }

  async extractFile(node: NzTreeNodeOptions): Promise<void> {
    await firstValueFrom(this.resourceFileService.unzipFile(this.resourceFile!.resourceFile, node.key))
    this.explorerService.refresh()
  }
}
