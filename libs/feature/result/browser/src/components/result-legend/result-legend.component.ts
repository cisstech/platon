import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'

import { NzListModule } from 'ng-zorro-antd/list'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { AnswerStates } from '@platon/feature/result/common'
import { AnswerStatePipesModule } from '../../pipes'

@Component({
  standalone: true,
  selector: 'result-legend',
  templateUrl: './result-legend.component.html',
  styleUrls: ['./result-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, NzListModule, NzToolTipModule, AnswerStatePipesModule],
})
export class ResultLegendComponent {
  protected answerStates = Object.values(AnswerStates)
}
