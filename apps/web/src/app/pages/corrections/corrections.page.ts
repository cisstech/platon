import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

import { UiLayoutTabsComponent, UiLayoutTabsTitleDirective } from '@platon/shared/ui';

@Component({
  standalone: true,
  selector: 'app-corrections',
  templateUrl: './corrections.page.html',
  styleUrls: ['./corrections.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzBreadCrumbModule,
    UiLayoutTabsComponent,
    UiLayoutTabsTitleDirective,
  ]
})
export class CorrectionsPage { }
