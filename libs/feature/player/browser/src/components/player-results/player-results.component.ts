import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@platon/core/browser';
import { User } from '@platon/core/common';
import { ActivityPlayer } from '@platon/feature/player/common';
import { AnswerStatePipesModule, ResultService } from '@platon/feature/result/browser';
import { UserResults } from '@platon/feature/result/common';
import { DurationPipe, UiModalTemplateComponent } from '@platon/shared/ui';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'player-results',
  templateUrl: './player-results.component.html',
  styleUrls: ['./player-results.component.scss', '../common.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    NzButtonModule,
    NzToolTipModule,
    DurationPipe,
    AnswerStatePipesModule,
    UiModalTemplateComponent,
  ],
})
export class PlayerResultsComponent implements OnInit {
  @Input() player!: ActivityPlayer;
  protected results?: UserResults;

  constructor(
    private readonly authService: AuthService,
    private readonly resultService: ResultService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    const user = (await this.authService.ready()) as User;
    if (this.player.activityId) {
      this.results = await firstValueFrom(
        this.resultService.userResults(
          this.player.activityId,
          user.id
        )
      );
    }
    this.changeDetectorRef.markForCheck();
  }
}
