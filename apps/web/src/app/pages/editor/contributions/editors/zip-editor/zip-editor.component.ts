/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { Subscription, firstValueFrom } from 'rxjs'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { ResourceFileImpl } from '../../file-system'
import { NzFormatEmitEvent, NzTreeNodeOptions } from 'ng-zorro-antd/tree'

@Component({
  selector: 'app-zip-editor',
  templateUrl: './zip-editor.component.html',
  styleUrls: ['./zip-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZipEditorComponent implements OnInit, OnDestroy {
  private readonly fileService = inject(FileService)
  private readonly resourceFileService = inject(ResourceFileService)
  private readonly subscriptions: Subscription[] = []
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected nodes: NzTreeNodeOptions[] = []
  protected fileName = ''

  @Input()
  protected editor!: Editor
  protected request!: OpenRequest

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
    const files = await firstValueFrom(this.resourceFileService.listZipFiles(file.resourceFile))
    this.nodes = this.buildNzTree(files)
    this.changeDetectorRef.markForCheck()
  }

  openFolder(event: NzFormatEmitEvent): void {
    const node = event.node
    if (node) {
      node.isExpanded = !node.isExpanded
    }
  }
}
