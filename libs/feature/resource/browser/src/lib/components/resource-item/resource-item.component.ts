import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  booleanAttribute,
  inject,
} from '@angular/core'

import { MatIconModule } from '@angular/material/icon'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { v4 as uuidv4 } from 'uuid'

import { ListItemTag, NgeUiListModule } from '@cisstech/nge/ui/list'
import { ExerciseResourceMeta, Resource } from '@platon/feature/resource/common'

import { UiModalIFrameComponent, positiveGreenColor } from '@platon/shared/ui'

import { RouterModule } from '@angular/router'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { StorageService } from '@platon/core/browser'
import { Variables } from '@platon/feature/compiler'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { firstValueFrom } from 'rxjs'
import { ResourceFileService } from '../../api/file.service'
import { ResourcePipesModule } from '../../pipes'

export const getPreviewOverridesStorageKey = (sessionId: string) => `preview.overrides.${sessionId}`
type Tag = {
  type: 'level' | 'topic'
  id: string
}

@Component({
  standalone: true,
  selector: 'resource-item',
  templateUrl: './resource-item.component.html',
  styleUrls: ['./resource-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,

    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzToolTipModule,
    NzPopoverModule,
    NzSpinModule,

    NgeUiListModule,
    NgeMarkdownModule,
    UiModalIFrameComponent,

    ResourcePipesModule,
  ],
})
export class ResourceItemComponent implements OnChanges {
  private readonly storageService = inject(StorageService)
  private readonly fileService = inject(ResourceFileService)
  protected name = ''
  protected desc = ''
  protected averageScore = 0
  protected attemptCount = 0
  protected averageScoreColor = 'var(--brand-text-primary, #000)'

  protected configurable = false
  protected tags: ListItemTag[] = []
  protected readme?: string

  @Input() item!: Resource
  @Input({ transform: booleanAttribute }) simple = false
  @Input({ transform: booleanAttribute }) modalMode = false
  @Input({ transform: booleanAttribute }) editable = true
  @Input({ transform: booleanAttribute }) clickable = true
  @Input() previewOverrides?: Variables
  @Output() levelClicked = new EventEmitter<string>()
  @Output() topicClicked = new EventEmitter<string>()

  get detailsUrl(): string {
    return `/resources/${this.item.id}`
  }

  get editorUrl(): string {
    return `/editor/${this.item.id}?version=latest`
  }

  get previewUrl(): string {
    const sessionId = uuidv4()
    if (this.previewOverrides) {
      firstValueFrom(
        this.storageService.set(getPreviewOverridesStorageKey(sessionId), JSON.stringify(this.previewOverrides))
      ).catch(console.error)
    }
    return `/player/preview/${this.item.id}?version=latest&sessionId=${sessionId}`
  }

  get referencesUrl(): string {
    return `/resources?dependOn=${this.item.id}`
  }

  ngOnChanges(): void {
    this.tags = []
    if (!this.simple) {
      this.item.levels?.forEach((level) =>
        this.tags.push({
          text: level.name,
          color: '#008080',
          data: {
            type: 'level',
            id: level.id,
          } as Tag,
        })
      )

      this.item.topics?.forEach((topic) =>
        this.tags.push({
          text: topic.name,
          color: '#FF7F50',
          data: {
            type: 'topic',
            id: topic.id,
          } as Tag,
        })
      )
    }

    this.name = this.item.name
    this.desc = this.item.desc as string
    this.averageScore = this.item.statistic?.activity?.averageScore ?? this.item.statistic?.exercise?.averageScore ?? 0
    this.attemptCount = this.item.statistic?.activity?.attemptCount ?? this.item.statistic?.exercise?.attemptCount ?? 0
    this.averageScoreColor = positiveGreenColor(this.averageScore)
    this.configurable = (this.item.metadata as ExerciseResourceMeta)?.configurable ?? false
  }

  protected openTab(url: string): void {
    window.open(url, '_blank')
  }

  protected handleTagClick(tag: ListItemTag<Tag>): void {
    if (!tag.data) return
    if (tag.data.type === 'level') {
      this.levelClicked.emit(tag.data.id)
    } else if (tag.data.type === 'topic') {
      this.topicClicked.emit(tag.data.id)
    }
  }

  protected async getReadmeContent(): Promise<void> {
    if (!this.readme) {
      this.readme = await firstValueFrom(this.fileService.content(`${this.item.id}/readme.md`))
    }
  }
}
