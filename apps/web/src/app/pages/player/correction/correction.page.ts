import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NzSpinModule } from 'ng-zorro-antd/spin';

import { PlayerCorrectionComponent } from '@platon/feature/player/browser';
import { Player } from '@platon/feature/player/common';
import { ResultService } from '@platon/feature/result/browser';
import { PendingCorrection } from '@platon/feature/result/common';
import { UiErrorComponent } from '@platon/shared/ui';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-player-correction',
  templateUrl: './correction.page.html',
  styleUrls: ['./correction.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzSpinModule,
    UiErrorComponent,
    PlayerCorrectionComponent,
  ],
})
export class PlayerCorrectionPage implements OnInit {
  protected player?: Player;
  protected loading = true;
  protected error: unknown;
  protected correction?: PendingCorrection;

  constructor(
    private readonly resultService: ResultService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const params = this.activatedRoute.snapshot.paramMap;
      const activityId = params.get('id') as string;
      const response = await firstValueFrom(
        this.resultService.listCorrections(activityId)
      );
      this.correction = response.resources[0];
    } catch (error) {
      this.error = error;
    } finally {
      this.loading = false;
      this.changeDetectorRef.markForCheck();
    }
  }
}
