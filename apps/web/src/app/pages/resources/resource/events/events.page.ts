/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { ResourceEventListComponent } from '@platon/feature/resource/browser'
import { ResourceEvent } from '@platon/feature/resource/common'
import { ResourcePresenter } from '../resource.presenter'

@Component({
  standalone: true,
  selector: 'app-resource-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ResourceEventListComponent],
})
export class ResourceEventsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  protected context = this.presenter.defaultContext()
  protected events: ResourceEvent[] = []

  constructor(private readonly presenter: ResourcePresenter, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        if (context.resource) {
          this.events = (
            await this.presenter.listEvents({
              limit: 50,
            })
          ).resources
        }
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
