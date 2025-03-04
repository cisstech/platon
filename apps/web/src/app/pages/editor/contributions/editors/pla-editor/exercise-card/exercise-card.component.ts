import { CommonModule } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
  booleanAttribute,
  inject,
} from '@angular/core'

import { MatIconModule } from '@angular/material/icon'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { v4 as uuidv4 } from 'uuid'

import { NgeUiListModule } from '@cisstech/nge/ui/list'
import { ExerciseResourceMeta, Resource, ResourceFile } from '@platon/feature/resource/common'

import { UiModalIFrameComponent, positiveGreenColor } from '@platon/shared/ui'

import { RouterModule } from '@angular/router'
import { StorageService } from '@platon/core/browser'
import { Variables } from '@platon/feature/compiler'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { firstValueFrom } from 'rxjs'
import { ResourcePipesModule } from '@platon/feature/resource/browser'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { NgeMarkdownModule } from '@cisstech/nge/markdown'
import { NzSpinModule } from 'ng-zorro-antd/spin'

export const getPreviewOverridesStorageKey = (sessionId: string) => `preview.overrides.${sessionId}`

@Component({
  standalone: true,
  selector: 'app-exercise-card',
  templateUrl: './exercise-card.component.html',
  styleUrls: ['./exercise-card.component.scss'],
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
export class ExerciseCardComponent implements OnChanges, AfterViewInit {
  private readonly storageService = inject(StorageService)
  private readonly fileService = inject(ResourceFileService)
  protected name = ''
  protected desc = ''
  protected averageScore = 0
  protected attemptCount = 0
  protected averageScoreColor = 'var(--brand-text-primary, #000)'

  protected configurable = false
  protected readme?: ResourceFile

  @Input() item!: Resource
  @Input({ transform: booleanAttribute }) modalMode = false
  @Input({ transform: booleanAttribute }) editable = true
  @Input({ transform: booleanAttribute }) clickable = true
  @Input({ transform: booleanAttribute }) showButton = true
  @Input() previewOverrides?: Variables
  @Output() exerciseClicked = new EventEmitter<Resource>()

  @ViewChild('articleComponent', { read: ElementRef }) articleComponentRef!: ElementRef

  ngAfterViewInit(): void {
    this.removeMatElevationClass()
  }

  private removeMatElevationClass(): void {
    const articleElement: HTMLElement = this.articleComponentRef.nativeElement
    const elementsWithMatElevation = articleElement.getElementsByClassName('mat-elevation-z1')
    Array.from(elementsWithMatElevation).forEach((element) => {
      element.classList.remove('mat-elevation-z1')
    })
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

  ngOnChanges(): void {
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

  // protected handleTagClick(tag: ListItemTag<Tag>): void {
  //   if (tag.data!.type === 'level') {
  //     this.levelClicked.emit(tag.data!.id)
  //   } else if (tag.data!.type === 'topic') {
  //     this.topicClicked.emit(tag.data!.id)
  //   }
  // }

  protected handleAddExercise(): void {
    this.exerciseClicked.emit(this.item)
  }

  protected getReadmeContent(): void {
    this.fileService.read(`${this.item.id}`, 'readme.md').subscribe((file) => {
      this.readme = file
    })
  }
}
