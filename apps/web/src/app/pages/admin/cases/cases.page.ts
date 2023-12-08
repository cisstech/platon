import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { CasCreateDrawerComponent, CasSearchBarComponent, CasTableComponent } from '@platon/feature/cas/browser'
import { Cas } from '@platon/feature/cas/common'
import { LTIService } from '@platon/feature/lti/browser'
import { Lms } from '@platon/feature/lti/common'

@Component({
  standalone: true,
  selector: 'app-admin-cases',
  templateUrl: './cases.page.html',
  styleUrls: ['./cases.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzIconModule,
    NzButtonModule,
    NzToolTipModule,

    CasTableComponent,
    CasSearchBarComponent,
    CasCreateDrawerComponent,
  ],
})
export class AdminCasesPage implements OnInit {
  protected cases: Cas[] = []
  lmses: Lms[] = []

  protected insert(cas: Cas) {
    this.cases = [cas, ...this.cases]
  }

  constructor(private readonly ltiService: LTIService, private readonly changeDectectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.ltiService.searchLms().subscribe((lmses) => {
      this.lmses = lmses.resources
      this.changeDectectorRef.markForCheck()
    })
  }
}
