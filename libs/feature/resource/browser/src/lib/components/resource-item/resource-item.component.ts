import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { v4 as uuidv4 } from 'uuid'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { ExerciseResourceMeta, Resource } from '@platon/feature/resource/common'

import { UiModalIFrameComponent } from '@platon/shared/ui'

import { StorageService } from '@platon/core/browser'
import { Variables } from '@platon/feature/compiler'
import { firstValueFrom } from 'rxjs'
import { ResourcePipesModule } from '../../pipes'

export const getPreviewOverridesStorageKey = (sessionId: string) => `preview.overrides.${sessionId}`

@Component({
  standalone: true,
  selector: 'resource-item',
  templateUrl: './resource-item.component.html',
  styleUrls: ['./resource-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,
    NzIconModule,
    NzBadgeModule,
    NzToolTipModule,

    NgeUiListModule,
    UiModalIFrameComponent,

    ResourcePipesModule,
  ],
})
export class ResourceItemComponent implements OnInit {
  @Input() item!: Resource
  @Input() simple = false
  @Input() modalMode = false
  @Input() previewOverrides?: Variables

  @Output() didTapTag = new EventEmitter<string>()

  protected name = ''
  protected desc = ''
  protected configurable = false
  protected tags: string[] = []

  get editorUrl(): string {
    return `/editor/${this.item.id}?version=latest`
  }

  get previewUrl(): string {
    const sessionId = uuidv4()
    if (this.previewOverrides) {
      firstValueFrom(
        this.storageService.set(getPreviewOverridesStorageKey(sessionId), JSON.stringify(this.previewOverrides))
      ).catch()
    }
    return `/player/preview/${this.item.id}?version=latest&sessionId=${sessionId}`
  }

  constructor(private readonly storageService: StorageService) {}

  ngOnInit(): void {
    if (!this.simple) {
      this.item.levels?.forEach((level) => this.tags.push(level.name))
      this.item.topics?.forEach((topic) => this.tags.push(topic.name))
    }

    this.name = this.item.name
    this.desc = this.item.desc as string
    this.configurable = (this.item.metadata as ExerciseResourceMeta)?.configurable ?? false

    if (this.simple) {
      this.desc = ''
    }
  }

  protected openTab(url: string): void {
    window.open(url, '_blank')
  }
}
