import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { LmsCreateDrawerComponent, LmsSearchBarComponent, LmsTableComponent } from '@platon/feature/lti/browser';
import { Lms } from '@platon/feature/lti/common';


@Component({
  standalone: true,
  selector: 'app-admin-lmses',
  templateUrl: './lmses.page.html',
  styleUrls: ['./lmses.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzIconModule,
    NzButtonModule,
    NzToolTipModule,

    LmsTableComponent,
    LmsSearchBarComponent,
    LmsCreateDrawerComponent,
  ]
})
export class AdminLmsesPage {
  protected lmses: Lms[] = [];

  protected insert(lms: Lms) {
    this.lmses = [lms, ...this.lmses];
  }
}
