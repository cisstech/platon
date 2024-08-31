/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { ClipboardService, PickerBrowserService } from '@cisstech/nge/services'
import { NgeUiIconModule } from '@cisstech/nge/ui/icon'
import { DialogModule, DialogService, UserAvatarComponent } from '@platon/core/browser'
import { GitLogResult, ResourceFile } from '@platon/feature/resource/common'
import { NzContextMenuService, NzDropDownModule, NzDropdownMenuComponent } from 'ng-zorro-antd/dropdown'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzTreeModule, NzTreeNode } from 'ng-zorro-antd/tree'
import { firstValueFrom } from 'rxjs'
import { ResourceFileService } from '../../api/file.service'
import { NzButtonModule } from 'ng-zorro-antd/button'

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
    NzButtonModule,

    DialogModule,
    NgeUiIconModule,
    NgeMarkdownModule,

    UserAvatarComponent,
  ],
})
export class ResourceFilesComponent implements OnInit {
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

  protected commits: CommitInfos[] = []

  @Input() gitLog: GitLogResult[] = []

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

  ngOnInit(): void {
    this.refreshGitLog()
  }

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
      this.clipboardService
        .copy(`${prefix}${prefix ? '/' : ''}${path}`)
        .then(() => {
          this.dialogService.success('Le chemin a été copié dans le presse-papiers')
        })
        .catch((error) => {
          console.error(error)
          this.dialogService.error('Impossible de copier le chemin dans le presse-papiers')
        })
    }
  }

  private compareNodes(a: Node, b: Node): number {
    if ((a.isLeaf && b.isLeaf) || (!a.isLeaf && !b.isLeaf)) {
      return a.title.localeCompare(b.title)
    }
    return a.isLeaf ? 1 : -1
  }

  protected refreshGitLog(limit50 = true): void {
    const commits: CommitInfos[] = []
    let gitLog = this.gitLog
    let nbOver50 = -1
    let initCommit
    if (limit50 && gitLog.length > 50) {
      nbOver50 = gitLog.length - 51
      initCommit = gitLog[gitLog.length - 1]
      gitLog = gitLog.slice(0, 50)
    }
    for (const commit of gitLog) {
      const c = commit.commit
      if (c.author.name === 'noname') {
        c.author.name = 'ypicker'
      }
      let displayAuthor = true
      if (commits.length !== 0) {
        const lastEventTimestamp = commits[commits.length - 1].date.getTime() / 1000
        if (c.author.name === commits[commits.length - 1]?.author && lastEventTimestamp - c.author.timestamp < 3600) {
          displayAuthor = false
        }
      }
      commits.push({
        id: c.tree,
        date: new Date(c.author.timestamp * 1000),
        author: c.author.name,
        message: c.message,
        displayAuthor: displayAuthor,
        isMore: false,
        tags: commit.tags,
      })
    }
    if (limit50) {
      if (nbOver50 > 0) {
        commits.push({
          id: '0',
          date: new Date(),
          author: '',
          message: `+ ${nbOver50} changements non affichés`,
          displayAuthor: false,
          isMore: true,
          tags: [],
        })
      }
      if (nbOver50 >= 0) {
        const c = initCommit!.commit
        commits.push({
          id: c.tree,
          date: new Date(c.author.timestamp * 1000),
          author: c.author.name,
          message: c.message,
          displayAuthor: true,
          isMore: false,
          tags: initCommit!.tags,
        })
      }
    }
    this.commits = commits
    this.changeDetectionRef.markForCheck()
  }
}

interface Node {
  key: string
  title: string
  isLeaf?: boolean
  children?: Node[]
}

interface CommitInfos {
  id: string
  date: Date
  author: string
  message: string
  displayAuthor: boolean
  isMore?: boolean
  tags: string[]
}
