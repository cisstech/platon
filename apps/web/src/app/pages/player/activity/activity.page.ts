import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { MatCardModule } from '@angular/material/card';

import { NzSpinModule } from 'ng-zorro-antd/spin';

import { PlayerResourceComponent, PlayerService } from '@platon/feature/player/browser';
import { Player } from '@platon/feature/player/common';


@Component({
  standalone: true,
  selector: 'app-player-activity',
  templateUrl: './activity.page.html',
  styleUrls: ['./activity.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzSpinModule,
    MatCardModule,
    PlayerResourceComponent,
  ]
})
export class PlayerActivityPage implements OnInit {
  protected player?: Player;
  protected loading = true;


  constructor(
    private readonly playerService: PlayerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    const params = this.activatedRoute.snapshot.paramMap;
    const activityId = params.get('id') as string;

    const output = await firstValueFrom(
      this.playerService.playActivity({
        courseActivityId: activityId
      })
    );

    this.player = output.activity;
    this.loading = false;
    this.changeDetectorRef.markForCheck();
  }
}
