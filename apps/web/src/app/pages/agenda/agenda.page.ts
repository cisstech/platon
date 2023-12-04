import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'

import { NzCalendarModule } from 'ng-zorro-antd/calendar'

@Component({
  standalone: true,
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzBreadCrumbModule, NzBadgeModule, NzCalendarModule],
})
export class AgendaPage {}
