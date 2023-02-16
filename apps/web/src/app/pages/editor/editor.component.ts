import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { NgeIdeModule } from '@cisstech/nge-ide';
import { NgeIdeExplorerModule } from '@cisstech/nge-ide/explorer';
import { NgeIdeSearchModule } from '@cisstech/nge-ide/search';
import { NgeIdeSettingsModule } from '@cisstech/nge-ide/settings';

import { FileService, IdeService } from '@cisstech/nge-ide/core';
import { NgeIdeNotificationsModule } from '@cisstech/nge-ide/notifications';
import { NgeIdeProblemsModule } from '@cisstech/nge-ide/problems';
import { Subscription } from 'rxjs';
import { RemoteFileSystemProvider } from './filesystem';

@Component({
  standalone: true,
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,


    NgeIdeModule,
    NgeIdeExplorerModule,
    NgeIdeSearchModule,
    NgeIdeSettingsModule,

    NgeIdeProblemsModule,
    NgeIdeNotificationsModule,
  ],
  providers: [
    RemoteFileSystemProvider,
  ]
})
export class EditorComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private readonly ide: IdeService,
    private readonly fileService: FileService,
    private readonly fileSystem: RemoteFileSystemProvider,
  ) { }


  ngOnInit(): void {
    this.subscription = this.ide.onAfterStart(() => {
      this.fileService.registerProvider(this.fileSystem);
      this.fileService.registerFolders(...this.fileSystem.listFolders());
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
