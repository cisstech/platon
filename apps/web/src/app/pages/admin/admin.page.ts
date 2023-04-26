import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { UiLayoutTabsComponent, UiLayoutTabsTitleDirective } from '@platon/shared/ui';


@Component({
  standalone: true,
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,
    NzBreadCrumbModule,

    UiLayoutTabsComponent,
    UiLayoutTabsTitleDirective,
  ]
})
export class AdminPage { }
