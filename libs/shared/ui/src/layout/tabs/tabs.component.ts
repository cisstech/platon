import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Input, OnDestroy, QueryList } from '@angular/core';

import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

import { RouterModule } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { Error403Component, Error404Component, Error500Component } from '../../error';
import { LayoutState } from '../layout';
import { LayoutTabsTitleDirective } from './directives/tab-title.directive';

@Component({
  standalone: true,
  selector: 'ui-layout-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    NzTabsModule,
    NzSkeletonModule,

    Error403Component,
    Error404Component,
    Error500Component,
  ]
})
export class LayoutTabsComponent implements AfterContentInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  @Input() state: LayoutState = 'READY';

  @ContentChildren(LayoutTabsTitleDirective)
  titles!: QueryList<LayoutTabsTitleDirective>;

  protected tabs: {
    title: LayoutTabsTitleDirective,
  }[] = [];

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  ngAfterContentInit(): void {

    const handleChanges = (titles: LayoutTabsTitleDirective[]) => {
      this.tabs = [];
      for (let i = 0; i < titles.length; i++) {
        this.tabs.push({ title: titles[i] })
      }
      this.changeDetectorRef.markForCheck();
    }

    handleChanges(this.titles.toArray());

    this.subscriptions.push(
      combineLatest([
        this.titles.changes as Observable<LayoutTabsTitleDirective[]>,
      ]).subscribe(([titles]) => {
        handleChanges(titles);
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected trackByIndex(index: number): number {
    return index;
  }
}
