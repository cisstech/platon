/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { Resource, resourceAncestors } from '@platon/feature/resource/common';
import { firstValueFrom, Subscription } from 'rxjs';
import { ResourcePresenter } from '../../resource.presenter';

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
    private readonly presenter: ResourcePresenter,
    private readonly fileService: FileService,
    private readonly resourceFileSystem: ResourceFileSystemProvider,
  ) { }


  async ngOnInit(): Promise<void> {

    const { resource, circles } = await firstValueFrom(this.presenter.contextChange);
    const ancestors = resourceAncestors(circles!, resource!.id);

    this.subscription = this.ide.onAfterStart(() => {
      this.fileService.registerProvider(this.resourceFileSystem);

      this.fileService.registerFolders(
        {
          name: `${resource!.name}#${this.version}`,
          uri: this.resourceFileSystem.buildUri(
            this.resource.id,
            this.version
          )
        },
        ...ancestors.map(ancestor => ({
          name: `${ancestor.name}#latest`,
          uri: this.resourceFileSystem.buildUri(
            ancestor.id
          )
        }))
      );
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
