import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { firstValueFrom } from 'rxjs'

import { PlayerService, PlayerWrapperComponent } from '@platon/feature/player/browser'
import { Player } from '@platon/feature/player/common'
import { UiErrorComponent } from '@platon/shared/ui'
import { NzSpinModule } from 'ng-zorro-antd/spin'

import { StorageService } from '@platon/core/browser'
import { Variables } from '@platon/feature/compiler'
import { getPreviewOverridesStorageKey } from '@platon/feature/resource/browser'

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
    private readonly storageService: StorageService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const params = this.activatedRoute.snapshot.paramMap
      const queryParams = this.activatedRoute.snapshot.queryParamMap

      const id = params.get('id')
      const version = queryParams.get('version')
      const sessionId = queryParams.get('sessionId')

      let overrides: Variables | undefined
      if (sessionId) {
        overrides = JSON.parse(
          (await firstValueFrom(
            this.storageService.getString(getPreviewOverridesStorageKey(sessionId))
          )) || '{}'
        )
      }

      const output = await firstValueFrom(
        this.playerService.preview({
          resource: id as string,
          version: version as string,
          overrides,
        })
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

  @HostListener('window:beforeunload')
  protected async onClose() {
    const queryParams = this.activatedRoute.snapshot.queryParamMap
    const sessionId = queryParams.get('sessionId')
    if (sessionId) {
      await firstValueFrom(this.storageService.remove(getPreviewOverridesStorageKey(sessionId)))
    }
  }
}
