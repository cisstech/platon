import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { RouterModule } from '@angular/router'
import { ActivityCorrection } from '@platon/feature/result/common'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { antTagColorFromPercentage } from '@platon/shared/ui'

type Item = ActivityCorrection & {
  exerciseCount: number
  correctedCount: number
  correctionStatusColor: string
}

@Component({
  standalone: true,
  selector: 'correction-table',
  templateUrl: './correction-table.component.html',
  styleUrls: ['./correction-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzTagModule, NzIconModule, NzTableModule, NzButtonModule, NzToolTipModule],
})
export class CorrectionTableComponent {
  protected dataSource: Item[] = []

  @Input()
  set corrections(value: ActivityCorrection[]) {
    this.dataSource = value.map((correction) => {
      const correctedCount = correction.exercises.filter((exercise) => exercise.correctedAt != null).length
      const exerciseCount = correction.exercises.length
      return {
        ...correction,
        correctedCount,
        exerciseCount,
        correctionStatusColor: antTagColorFromPercentage(Math.round((correctedCount / exerciseCount) * 100)),
      }
    })
  }
}
