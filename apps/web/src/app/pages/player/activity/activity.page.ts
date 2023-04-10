import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { MatCardModule } from '@angular/material/card';

import { NzSpinModule } from 'ng-zorro-antd/spin';

import { PlayerService, PlayerWrapperComponent } from '@platon/feature/player/browser';
import { Player } from '@platon/feature/player/common';
import { UiErrorComponent } from '@platon/shared/ui';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';


@Component({
  standalone: true,
  selector: 'app-player-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzSpinModule,
    NzSkeletonModule,
    MatCardModule,

    UiErrorComponent,
    PlayerWrapperComponent,
  ]
})
export class PlayerActivityPage implements OnInit {
  protected player?: Player;
  protected loading = true;
  protected error: unknown;

  constructor(
    private readonly playerService: PlayerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    const params = this.activatedRoute.snapshot.paramMap;
    const activityId = params.get('id') as string;

    try {
      const output = await firstValueFrom(
        this.playerService.playActivity({ activityId })
      );
      this.player = output.activity;

    } catch (error) {
      this.error = error;
      console.log(error)
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }

  }
}
