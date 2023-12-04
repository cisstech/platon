import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzTypographyModule } from 'ng-zorro-antd/typography'

import { DialogModule } from '@platon/core/browser'
import { CircleTreeComponent, ResourcePipesModule, ResourceSharingComponent } from '@platon/feature/resource/browser'
import { ResourceStatus } from '@platon/feature/resource/common'
import { UiLayoutTabDirective, UiLayoutTabsComponent, UiModalIFrameComponent } from '@platon/shared/ui'

import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { ResourcePresenter } from './resource.presenter'

@Component({
  standalone: true,
  selector: 'app-resource',
  templateUrl: './resource.page.html',
  styleUrls: ['./resource.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResourcePresenter],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatIconModule,
    MatChipsModule,

    NzIconModule,
    NzSelectModule,
    NzButtonModule,
    NzPopoverModule,
    NzToolTipModule,
    NzBreadCrumbModule,
    NzTypographyModule,
    NzPageHeaderModule,

    DialogModule,

    UiLayoutTabsComponent,
    UiModalIFrameComponent,
    UiLayoutTabDirective,

    CircleTreeComponent,
    ResourcePipesModule,
    ResourceSharingComponent,
  ],
})
export class ResourcePage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(ResourcePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected context = this.presenter.defaultContext()

  readonly status = Object.values(ResourceStatus)

  get isOtherPersonal(): boolean {
    return this.context.resource!.personal && this.context.resource!.ownerId !== this.context.user!.id
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async updateName(name: string) {
    if (name.trim()) {
      await this.presenter.update({ name })
    }
  }

  protected async updateDesc(desc: string) {
    if (desc.trim()) {
      await this.presenter.update({ desc })
    }
  }

  protected async updateStatus(status: ResourceStatus) {
    await this.presenter.update({ status })
  }

  protected async changeWatchingState(): Promise<void> {
    if (this.context.resource?.permissions?.watcher) {
      await this.presenter.unwatch()
    } else {
      await this.presenter.watch()
    }
  }

  protected async join(): Promise<void> {
    await this.presenter.join()
  }

  protected async unjoin(): Promise<void> {
    await this.presenter.unjoin()
  }

  protected trackByValue(_: number, item: unknown) {
    return item
  }

  protected openTab(url: string): void {
    window.open(url, '_blank')
  }
}
