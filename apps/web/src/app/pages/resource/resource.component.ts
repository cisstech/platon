import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { DialogModule } from '@platon/core/browser';
import { ResourcePipesModule } from '@platon/feature/resource/browser';
import { ResourceStatus } from '@platon/feature/resource/common';
import { UiLayoutTabsComponent, UiLayoutTabsTitleDirective } from '@platon/shared/ui';
import { Subscription } from 'rxjs';
import { ResourcePresenter } from './resource.presenter';

@Component({
  standalone: true,
  selector: 'app-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResourcePresenter],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule,

    NzIconModule,
    NzButtonModule,
    NzSelectModule,
    NzBreadCrumbModule,

    DialogModule,

    UiLayoutTabsComponent,
    UiLayoutTabsTitleDirective,

    ResourcePipesModule,
  ]
})
export class ResourceComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected context = this.presenter.defaultContext();

  readonly status = Object.values(ResourceStatus);

  constructor(
    private readonly presenter: ResourcePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected async updateStatus(status: ResourceStatus) {
    await this.presenter.update({ status });
  }

  protected async acceptInvitation(): Promise<void> {
    await this.presenter.acceptInvitation();
  }

  protected async declineInvitation(): Promise<void> {
    await this.presenter.declineInvitation();
  }

  protected async changeWatchingState(): Promise<void> {
    if (this.context.watcher) {
      await this.presenter.unwatch();
    } else {
      await this.presenter.watch();
    }
  }

  protected trackByValue(_: number, item: unknown) {
    return item;
  }
}
