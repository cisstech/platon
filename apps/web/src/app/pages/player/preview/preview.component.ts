import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { PlayerResourceComponent, PlayerService } from '@platon/feature/player/browser';
import { Player } from '@platon/feature/player/common';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-resource-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzSpinModule,
    MatCardModule,
    PlayerResourceComponent,
  ]
})
export class ResourcePreviewComponent implements OnInit {
  protected player?: Player;
  protected loading = true;


  constructor(
    private readonly playerService: PlayerService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    const params = this.activatedRoute.snapshot.paramMap;
    const queryParams = this.activatedRoute.snapshot.queryParamMap;
    const resourceId = params.get('id');
    const resourceVersion = queryParams.get('version');
    const output = await firstValueFrom(
      this.playerService.preview(resourceId as string, resourceVersion as string)
    );
    this.player = output.activity || output.exercise;
    this.loading = false;
    this.changeDetectorRef.markForCheck();
  }
}
