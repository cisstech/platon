import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { DialogModule } from '@platon/core/browser';
import { UiLayoutTabsComponent, UiLayoutTabsTitleDirective } from '@platon/shared/ui';


@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,

    NzIconModule,
    NzButtonModule,
    NzSelectModule,
    NzBreadCrumbModule,
    NzTypographyModule,

    DialogModule,

    UiLayoutTabsComponent,
    UiLayoutTabsTitleDirective,
  ]
})
export class SettingsPage { }
