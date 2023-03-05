import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';

import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCalendarModule } from 'ng-zorro-antd/calendar';

@Component({
  standalone: true,
  selector: 'app-overview',
  templateUrl: './overview.page.html',
  styleUrls: ['./overview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatCardModule,

    NzEmptyModule,
    NzGridModule,
    NzBadgeModule,
    NzButtonModule,
    NzCalendarModule,
  ]
})
export class OverviewPage {}
