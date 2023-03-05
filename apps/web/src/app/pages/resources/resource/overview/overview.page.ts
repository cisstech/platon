/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { MatButtonModule } from '@angular/material/button';
import { RESOURCE_STATUS_NAMES } from '@platon/feature/resource/browser';
import { ResourceStatus } from '@platon/feature/resource/common';
import { ResourcePresenter } from '../resource.presenter';


@Component({
  standalone: true,
  selector: 'app-resource-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatChipsModule,
    MatButtonModule,

    NzGridModule,
    NzEmptyModule,
    NzButtonModule,
    NzStatisticModule,

    NgxChartsModule,
  ]
})
export class ResourceOverviewPage implements OnInit, AfterViewChecked, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  protected view: [number, number] = [0, 0];
  protected context = this.presenter.defaultContext();
  protected statuses: Data[] = [];

  constructor(
    private readonly router: Router,
    private readonly presenter: ResourcePresenter,
    private readonly elementRef: ElementRef<HTMLElement>,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        if (context.statistic) {
          this.statuses = Object.values(ResourceStatus)
            .map(status => ({
              name: status,
              value: (context.statistic as any)[status.toLowerCase()]
            }))
        }
        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngAfterViewChecked(): void {
    this.view = [
      this.elementRef.nativeElement.offsetWidth * 0.75,
      400
    ];
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected formatStatus(status: string | unknown): string {
    if (typeof status === 'object')
      return RESOURCE_STATUS_NAMES[(status as any).data?.name as ResourceStatus] || ''
    return RESOURCE_STATUS_NAMES[status as ResourceStatus]
  }

  protected searchByStatus(status: string) {
    this.router.navigate(['/resources'], {
      queryParams: {
        status,
        parent: this.context.resource?.id
      }
    })
  }

  protected trackById(index: number, item: any) {
    return item.id || index;
  }
}

interface Data {
  name: string;
  value: number
}
