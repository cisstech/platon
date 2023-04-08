/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, OnDestroy, OnInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';

import { NgeIdeModule } from '@cisstech/nge-ide';
import { NgeIdeExplorerModule } from '@cisstech/nge-ide/explorer';
import { NgeIdeSearchModule } from '@cisstech/nge-ide/search';
import { NgeIdeSettingsModule } from '@cisstech/nge-ide/settings';
import { NgeIdeProblemsModule } from '@cisstech/nge-ide/problems';
import { NgeIdeNotificationsModule } from '@cisstech/nge-ide/notifications';
import { FileService, IdeService } from '@cisstech/nge-ide/core';

import { resourceAncestors, ResourceTypes } from '@platon/feature/resource/common';
import { ResourceService } from '@platon/feature/resource/browser';

import { PLFormEditorContributionModule } from './contributions/pl-form-editor/pl-form-editor.contribution';
import { ResourceFileSystemProvider } from './contributions/file-system';

@Component({
  standalone: true,
  selector: 'app-resource-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,


    NgeIdeModule,
    NgeIdeExplorerModule,
    NgeIdeSearchModule,
    NgeIdeSettingsModule,

    NgeIdeProblemsModule,
    NgeIdeNotificationsModule,

    PLFormEditorContributionModule,
  ],
  providers: [
    ResourceFileSystemProvider,
  ]
})
export class EditorPage implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(
    private readonly ide: IdeService,
    private readonly fileService: FileService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly resourceFileSystemProvider: ResourceFileSystemProvider,
  ) { }


  async ngOnInit(): Promise<void> {

    const params = this.activatedRoute.snapshot.paramMap;
    const queryParams = this.activatedRoute.snapshot.queryParamMap;

    const id = params.get('id') as string;
    const version = queryParams.get('version') || 'latest';


    const [resource, circles] = await Promise.all([
      firstValueFrom(this.resourceService.find(id)),
      firstValueFrom(this.resourceService.tree()),
    ])

    const ancestors = resource!.type === ResourceTypes.CIRCLE
      ? resourceAncestors(circles!, resource!.id)
      : resourceAncestors(circles!, resource!.parentId!);

    this.subscription = this.ide.onAfterStart(() => {
      this.fileService.registerProvider(this.resourceFileSystemProvider);
      this.fileService.registerFolders(
        {
          name: `${resource!.name}#${version}`,
          uri: this.resourceFileSystemProvider.buildUri(id, version)
        },
        ...ancestors.map(ancestor => ({
          name: `${ancestor.name}#latest`,
          uri: this.resourceFileSystemProvider.buildUri(
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
