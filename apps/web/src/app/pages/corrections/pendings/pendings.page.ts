import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'
import { CorrectionTableComponent, ResultService } from '@platon/feature/result/browser'
import { ActivityCorrection } from '@platon/feature/result/common'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-corrections-pendings',
  templateUrl: './pendings.page.html',
  styleUrls: ['./pendings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzEmptyModule, CorrectionTableComponent, NzSpinModule],
})
export class CorrectionsPendingsPage implements OnInit {
  private readonly resultService = inject(ResultService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected corrections: ActivityCorrection[] = []
  protected loading = true

  async ngOnInit(): Promise<void> {
    const response = await firstValueFrom(this.resultService.listPendingCorrections())
    this.corrections = response.resources
    this.changeDetectorRef.markForCheck()
    this.loading = false
  }
}
