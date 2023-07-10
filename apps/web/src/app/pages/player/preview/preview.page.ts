import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { firstValueFrom } from 'rxjs'

import { PlayerService, PlayerWrapperComponent } from '@platon/feature/player/browser'
import { Player } from '@platon/feature/player/common'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { UiErrorComponent } from '@platon/shared/ui'

@Component({
  standalone: true,
  selector: 'app-player-preview',
  templateUrl: './preview.page.html',
  styleUrls: ['./preview.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzSpinModule, UiErrorComponent, PlayerWrapperComponent],
})
export class PlayerPreviewPage implements OnInit {
  protected player?: Player
  protected loading = true
  protected error?: unknown

  constructor(
    private readonly playerService: PlayerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const params = this.activatedRoute.snapshot.paramMap
      const queryParams = this.activatedRoute.snapshot.queryParamMap
      const resourceId = params.get('id')
      const resourceVersion = queryParams.get('version')

      const output = await firstValueFrom(
        this.playerService.preview(resourceId as string, resourceVersion as string)
      )
      this.player = output.activity || output.exercise
    } catch (error) {
      this.error = error
    } finally {
      this.loading = false
      this.changeDetectorRef.markForCheck()
    }

    this.loading = false
    this.changeDetectorRef.markForCheck()
  }
}
