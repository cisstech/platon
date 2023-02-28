import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';


import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { SafePipeModule } from '@cisstech/nge/pipes';
import { ActivityPlayer, ExercisePlayer, Player, PlayerNavigation, PlayerPage } from '@platon/feature/player/common';

import { PlayerService } from '../../api/player.service';
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component';
import { PlayerNavigationComponent } from '../player-navigation/player-navigation.component';
import { PlayerSettingsComponent } from '../player-settings/player-settings.component';

@Component({
  standalone: true,
  selector: 'player-activity',
  templateUrl: './player-activity.component.html',
  styleUrls: ['./player-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatCardModule,
    MatButtonModule,

    NzBadgeModule,

    SafePipeModule,

    PlayerExerciseComponent,
    PlayerSettingsComponent,
    PlayerNavigationComponent,
  ]
})
export class PlayerActivityComponent implements OnInit {
  @Input() player!: ActivityPlayer;
  protected exercises?: ExercisePlayer[];

  @HostBinding('class.play-mode')
  protected get hostClasses(): boolean {
    return !!this.exercises && !!this.player.navigation;
  }

  constructor(
    private readonly playerService: PlayerService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const { navigation } = this.player;
    if (navigation.started && !navigation.terminated) {
      if ('composed' === this.player.settings?.navigation?.mode) {
        this.playAll();
      } else if (navigation.started && !navigation.terminated && navigation.current) {
        this.play(navigation.current);
      }
    }
  }

  protected start(): void {
    if ('composed' === this.player.settings?.navigation?.mode) {
      this.playAll();
    } else {
      this.play(this.player.navigation.items[0]);
    }
  }

  protected async terminate(): Promise<void> {
    const output = await firstValueFrom(
      this.playerService.terminate(this.player.sessionId)
    );
    this.player = output.activity;
    this.exercises = undefined;
    this.changeDetectorRef.markForCheck();
  }

  protected updateNavigation(navigation: PlayerNavigation): void {
    this.player = {
      ...this.player,
      navigation
    }
  }

  protected trackPlayer(_: number, item: Player): string {
    return item.sessionId;
  }

  protected async play(page: PlayerPage) {
    if ('composed' === this.player.settings?.navigation?.mode) {
      this.jumpToExercise(page);
      return;
    }

    this.exercises = undefined;

    const output = await firstValueFrom(
      this.playerService.playExercises({
        activitySessionId: this.player.sessionId,
        exerciseSessionIds: [page.sessionId],
      })
    );

    if (output.navigation) {
      this.player.navigation = output.navigation;
    }

    this.exercises = output.exercises;

    this.changeDetectorRef.markForCheck();
  }

  protected async playAll(): Promise<void> {
    const output = await firstValueFrom(
      this.playerService.playExercises({
        activitySessionId: this.player.sessionId,
        exerciseSessionIds: this.player.navigation.items.map(item => item.sessionId),
      })
    );

    this.exercises = output.exercises;
    if (output.navigation) {
      this.player.navigation = output.navigation;
    }

    this.changeDetectorRef.markForCheck();
  }

  private jumpToExercise(page: PlayerPage) {
    // TODO use Renderer2 if angular universal support is planned.
    const node = document.getElementById(page.sessionId);
    if (node) {
      node.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      node.classList.add('animate');
    }
    setTimeout(() => {
      node?.classList?.remove('animate');
    }, 500);
  }
}
