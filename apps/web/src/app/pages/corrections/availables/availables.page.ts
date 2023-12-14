import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'
import { CorrectionTableComponent, ResultService } from '@platon/feature/result/browser'
import { ActivityCorrection } from '@platon/feature/result/common'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-corrections-availables',
  templateUrl: './availables.page.html',
  styleUrls: ['./availables.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzEmptyModule, CorrectionTableComponent],
})
export class CorrectionsAvailablesPage implements OnInit {
  private readonly resultService = inject(ResultService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected corrections: ActivityCorrection[] = []

  async ngOnInit(): Promise<void> {
    const response = await firstValueFrom(this.resultService.listAvailableCorrections())
    this.corrections = response.resources
    this.changeDetectorRef.markForCheck()
  }
}
