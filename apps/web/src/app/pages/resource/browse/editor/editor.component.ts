import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

import { NgeIdeModule } from '@cisstech/nge-ide';
import { NgeIdeExplorerModule } from '@cisstech/nge-ide/explorer';
import { NgeIdeSearchModule } from '@cisstech/nge-ide/search';
import { NgeIdeSettingsModule } from '@cisstech/nge-ide/settings';

import { FileService, IdeService } from '@cisstech/nge-ide/core';
import { NgeIdeNotificationsModule } from '@cisstech/nge-ide/notifications';
import { NgeIdeProblemsModule } from '@cisstech/nge-ide/problems';
import { ResourceFileSystemProvider } from '@platon/feature/resource/browser';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Resource } from '@platon/feature/resource/common';

@Component({
  standalone: true,
  selector: 'app-resource-editor',
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
    ResourceFileSystemProvider,
  ]
})
export class ResourceEditorComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  @Input() resource!: Resource;
  @Input() version = 'latest';

  constructor(
    private readonly ide: IdeService,
    private readonly fileService: FileService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceFileSystem: ResourceFileSystemProvider,
  ) { }


  ngOnInit(): void {
    this.subscription = this.ide.onAfterStart(() => {
      this.fileService.registerProvider(this.resourceFileSystem);
      this.fileService.registerFolders({
        name: '/',
        uri: this.resourceFileSystem.buildUri(
          this.resource.id,
          this.version
        ),
      },
     );
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
