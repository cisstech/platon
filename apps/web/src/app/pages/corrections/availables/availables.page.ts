import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { ResultService } from '@platon/feature/result/browser'
import { PendingCorrection } from '@platon/feature/result/common'

@Component({
  standalone: true,
  selector: 'app-corrections-availables',
  templateUrl: './availables.page.html',
  styleUrls: ['./availables.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class CorrectionsAvailablesPage implements OnInit {
  protected corrections: PendingCorrection[] = []

  constructor(
    private readonly resultService: ResultService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.changeDetectorRef.markForCheck()
  }
}
