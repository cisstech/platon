import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'

import { SafePipeModule } from '@cisstech/nge/pipes'
import { NzModalModule } from 'ng-zorro-antd/modal'

import { NgeUiIconModule } from '@cisstech/nge/ui/icon'

import { ResourceFilesComponent } from '@platon/feature/resource/browser'
import { FileVersions, ResourceFile } from '@platon/feature/resource/common'
import { UiModalIFrameComponent } from '@platon/shared/ui'

import { ResourcePresenter } from '../resource.presenter'
import { ResourceBrowseHeaderComponent } from './header/header.component'

@Component({
  standalone: true,
  selector: 'app-resource-browse',
  templateUrl: './browse.page.html',
  styleUrls: ['./browse.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzModalModule,
    NgeUiIconModule,

    SafePipeModule,
    UiModalIFrameComponent,

    ResourceFilesComponent,
    ResourceBrowseHeaderComponent,
  ],
})
export class ResourceBrowsePage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []

  protected context = this.presenter.defaultContext()

  protected tree?: ResourceFile
  protected version = 'latest'
  protected versions?: FileVersions

  get editorUrl(): string {
    return `/editor/${this.context.resource?.id}?version=${this.version}`
  }

  get previewUrl(): string {
    return `/player/preview/${this.context.resource?.id}?version=${this.version}`
  }

  constructor(private readonly presenter: ResourcePresenter, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.refresh()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async refresh(version = 'latest') {
    this.version = version
    const [tree, versions] = await this.presenter.files(version)
    this.tree = tree
    this.versions = versions
    this.changeDetectorRef.markForCheck()
  }
}
