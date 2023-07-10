import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { PendingCorrection } from '@platon/feature/result/common'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { RouterModule } from '@angular/router'

@Component({
  standalone: true,
  selector: 'correction-pendings',
  templateUrl: './correction-pendings.component.html',
  styleUrls: ['./correction-pendings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzIconModule, NzEmptyModule, NzTableModule, NzButtonModule, NzToolTipModule],
})
export class CorrectionPendingsComponent {
  @Input() corrections!: PendingCorrection[]
}
