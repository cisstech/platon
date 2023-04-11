import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CorrectionPendingsComponent, ResultService } from '@platon/feature/result/browser';
import { PendingCorrection } from '@platon/feature/result/common';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-corrections-pendings',
  templateUrl: './pendings.page.html',
  styleUrls: ['./pendings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CorrectionPendingsComponent,
  ]
})
export class CorrectionsPendingsPage implements OnInit {
  protected corrections: PendingCorrection[] = [];

  constructor(
    private readonly resultService: ResultService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    const response = await firstValueFrom(
      this.resultService.listCorrections()
    );
    this.corrections = response.resources;
    this.changeDetectorRef.markForCheck();
  }
}
