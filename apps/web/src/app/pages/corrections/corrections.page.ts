import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'

import { NzAlertModule } from 'ng-zorro-antd/alert'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'

import { UiLayoutTabDirective, UiLayoutTabsComponent } from '@platon/shared/ui'

@Component({
  standalone: true,
  selector: 'app-corrections',
  templateUrl: './corrections.page.html',
  styleUrls: ['./corrections.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzAlertModule,
    NzBreadCrumbModule,
    UiLayoutTabsComponent,
    UiLayoutTabDirective,
  ],
})
export class CorrectionsPage {}
