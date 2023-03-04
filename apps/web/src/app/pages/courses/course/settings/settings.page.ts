/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { MatCardModule } from '@angular/material/card';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

import { NgxChartsModule } from '@swimlane/ngx-charts';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { CoursePresenter } from '../course.presenter';


@Component({
  standalone: true,
  selector: 'app-course-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,
    MatChipsModule,
    MatButtonModule,

    NzGridModule,
    NzEmptyModule,
    NzStatisticModule,

    NgxChartsModule,
  ]
})
export class CourseSettingsPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  protected context = this.presenter.defaultContext();


  constructor(
    private readonly presenter: CoursePresenter,
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

}
