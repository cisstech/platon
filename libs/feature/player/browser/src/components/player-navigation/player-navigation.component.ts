import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core'

import { NzTimelineModule } from 'ng-zorro-antd/timeline'

import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

import { ActivityPlayer, PlayerExercise } from '@platon/feature/player/common'

import { DialogModule, DialogService, UserAvatarComponent } from '@platon/core/browser'
import { AnswerStatePipesModule } from '@platon/feature/result/browser'

@Component({
  standalone: true,
  selector: 'player-navigation',
  templateUrl: './player-navigation.component.html',
  styleUrls: ['./player-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,
    MatCardModule,
    MatButtonModule,

    NzTimelineModule,

    DialogModule,
    UserAvatarComponent,
    AnswerStatePipesModule,
  ],
})
export class PlayerNavigationComponent {
  private readonly dialogService = inject(DialogService)

  @Input() player!: ActivityPlayer
  @Output() navigate = new EventEmitter<PlayerExercise>()
  // We pass an input instead of using output because of ant design popover behavior
  @Input() terminate?: () => void

  protected trackPage(_: number, page: PlayerExercise): string {
    return page.sessionId
  }

  protected isActiveSession(sessionId: string): boolean {
    if (this.player.settings?.navigation?.mode === 'composed') {
      return false
    }
    return sessionId === this.player.navigation.current?.sessionId
  }
}
