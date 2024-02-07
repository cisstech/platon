import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { MatIconModule } from '@angular/material/icon'

import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { UserAvatarComponent } from '@platon/core/browser'
import { AnswerStates, UserResults } from '@platon/feature/result/common'
import { DurationPipe, UiStatisticCardComponent } from '@platon/shared/ui'
import { AnswerStatePipesModule } from '../../pipes'

@Component({
  standalone: true,
  selector: 'result-by-members',
  templateUrl: './result-by-members.component.html',
  styleUrls: ['./result-by-members.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,

    NzGridModule,
    NzTableModule,
    NzToolTipModule,
    NzPopoverModule,

    DurationPipe,

    UserAvatarComponent,
    AnswerStatePipesModule,
    UiStatisticCardComponent,
  ],
})
export class ResultByMembersComponent {
  @Input({ required: true }) results: UserResults[] = []
  protected answerStates = Object.values(AnswerStates)
}
