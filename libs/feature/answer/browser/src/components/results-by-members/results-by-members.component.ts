import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UserAvatarComponent } from '@platon/core/browser';
import { UserResults } from '@platon/feature/answer/common';
import { AnswerStatePipesModule } from '@platon/feature/player/browser';
import { AnswerStates } from '@platon/feature/player/common';
import { DurationPipe } from '@platon/shared/ui';

@Component({
  standalone: true,
  selector: 'answer-results-by-members',
  templateUrl: './results-by-members.component.html',
  styleUrls: ['./results-by-members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatCardModule,
    MatIconModule,

    NzGridModule,
    NzIconModule,
    NzTableModule,
    NzButtonModule,
    NzListModule,
    NzToolTipModule,
    NzStatisticModule,
    NzPopoverModule,

    DurationPipe,

    UserAvatarComponent,
    AnswerStatePipesModule,
  ]
})
export class AnswerResultsByMembersComponent {
  @Input() results!: UserResults[];
  protected answerStates = Object.values(AnswerStates);
}
