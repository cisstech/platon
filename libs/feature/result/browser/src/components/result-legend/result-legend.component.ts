import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

import { NzListModule } from 'ng-zorro-antd/list';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { AnswerStatePipesModule } from '@platon/feature/player/browser';
import { AnswerStates } from '@platon/feature/player/common';

@Component({
  standalone: true,
  selector: 'result-legend',
  templateUrl: './result-legend.component.html',
  styleUrls: ['./result-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzListModule,
    NzToolTipModule,
    AnswerStatePipesModule,
  ]
})
export class ResultLegendComponent {
  protected answerStates = Object.values(AnswerStates);
}
