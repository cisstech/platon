/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { Subscription } from 'rxjs'

import { ResourceEventListComponent } from '@platon/feature/resource/browser'
import { FileChangeEvent, ResourceEvent, ResourceEventTypes } from '@platon/feature/resource/common'
import { ResourcePresenter } from '../resource.presenter'
import { ReadCommitResult } from 'isomorphic-git'
import { ResourcePipesModule } from '@platon/feature/resource/browser'

@Component({
  standalone: true,
  selector: 'app-resource-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ResourceEventListComponent, ResourcePipesModule],
})
export class ResourceEventsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  protected context = this.presenter.defaultContext()
  protected events: ResourceEvent[] = []
  protected gitLog: ReadCommitResult[] = []

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
          this.gitLog = await this.presenter.log()
          this.updateEventsWithLog()
        }
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  private concatSorted(commitEvents: FileChangeEvent[]): void {
    const result: ResourceEvent[] = []
    let i = 0
    let j = 0
    while (i < this.events.length && j < commitEvents.length) {
      if (this.events[i].createdAt > commitEvents[j].createdAt) {
        result.push(this.events[i])
        i++
      } else {
        result.push(commitEvents[j])
        j++
      }
    }
    this.events = result.concat(this.events.slice(i)).concat(commitEvents.slice(j))
  }

  updateEventsWithLog(): void {
    const commitEvents: FileChangeEvent[] = []
    let nbOver50 = 0
    if (this.gitLog.length > 50) {
      nbOver50 = this.gitLog.length - 50
      this.gitLog = this.gitLog.slice(0, 50)
    }
    for (const commit of this.gitLog) {
      const c = commit.commit
      if (c.author.name === 'noname') {
        c.author.name = 'ypicker'
      }
      let displayAuthor = true
      if (commitEvents.length !== 0) {
        const lastEventTimestamp = commitEvents[commitEvents.length - 1].createdAt.getTime() / 1000
        if (
          c.author.name === commitEvents[commitEvents.length - 1]?.actorId &&
          lastEventTimestamp - c.author.timestamp < 3600
        ) {
          displayAuthor = false
        }
      }
      commitEvents.push({
        id: c.tree,
        type: ResourceEventTypes.RESOURCE_FILE_CHANGE,
        createdAt: new Date(c.author.timestamp * 1000),
        updatedAt: new Date(c.author.timestamp * 1000),
        actorId: c.author.name,
        resourceId: this.context.resource!.id,
        data: {
          resourceId: this.context.resource!.id,
          resourceName: this.context.resource!.name,
          resourceType: this.context.resource!.type,
          commitMessage: c.message,
          displayAuthor: displayAuthor,
          isMore: false,
        },
      })
    }
    if (nbOver50 > 0) {
      commitEvents.push({
        id: '0',
        type: ResourceEventTypes.RESOURCE_FILE_CHANGE,
        createdAt: new Date(0),
        updatedAt: new Date(0),
        actorId: 'ypicker',
        resourceId: this.context.resource!.id,
        data: {
          resourceId: this.context.resource!.id,
          resourceName: this.context.resource!.name,
          resourceType: this.context.resource!.type,
          commitMessage: `+ ${nbOver50} changements non affichés`,
          displayAuthor: false,
          isMore: true,
        },
      })
    }
    this.concatSorted(commitEvents)
  }
}
