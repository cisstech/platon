/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { delay, firstValueFrom, Subscription } from 'rxjs';

import { NgeIdeModule } from '@cisstech/nge-ide';
import { EditorService, FileService, IdeService } from '@cisstech/nge-ide/core';
import { NgeIdeExplorerModule } from '@cisstech/nge-ide/explorer';
import { NgeIdeNotificationsModule } from '@cisstech/nge-ide/notifications';
import { NgeIdeProblemsModule } from '@cisstech/nge-ide/problems';
import { NgeIdeSearchModule } from '@cisstech/nge-ide/search';
import { NgeIdeSettingsModule } from '@cisstech/nge-ide/settings';

import { ResourceService } from '@platon/feature/resource/browser';
import { circleFromTree, resourceAncestors, ResourceTypes } from '@platon/feature/resource/common';

import { PlaEditorContributionModule } from './contributions/pla-editor';
import { PlfEditorContributionModule } from './contributions/plf-editor';

import { ResourceFileSystemProvider } from './contributions/file-system';
import { PlPreviewContributionModule } from './contributions/pl-preview.contribution';

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

    PlfEditorContributionModule,
    PlaEditorContributionModule,
    PlPreviewContributionModule,
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
    private readonly editorService: EditorService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
    private readonly resourceFileSystemProvider: ResourceFileSystemProvider,
  ) { }


  async ngOnInit(): Promise<void> {

    const params = this.activatedRoute.snapshot.paramMap;
    const queryParams = this.activatedRoute.snapshot.queryParamMap;

    const id = params.get('id') as string;
    const version = queryParams.get('version') || 'latest';
    const file = queryParams.get('file') || '/main.ple';

    const [resource, circles] = await Promise.all([
      firstValueFrom(this.resourceService.find(id)),
      firstValueFrom(this.resourceService.tree()),
    ])

    const ancestors = resource!.type === ResourceTypes.CIRCLE
      ? resourceAncestors(circles!, resource!.id)
      : [
        circleFromTree(circles!, resource!.parentId!)!,
        ...resourceAncestors(circles!, resource!.parentId!)
      ];

    this.subscription = this.ide.onAfterStart(() => {
      this.fileService.registerProvider(this.resourceFileSystemProvider);
      this.fileService.registerFolders(
        {
          name: `${resource!.name}#${version}`,
          uri: this.resourceFileSystemProvider.buildUri(id, version)
        },
        ...ancestors.map(ancestor => ({
          name: `@${ancestor.code}#latest`,
          uri: this.resourceFileSystemProvider.buildUri(
            ancestor.code || ancestor.id,
          )
        }))
      ).then(() => {
        this.editorService.open(this.resourceFileSystemProvider.buildUri(id, version).with({ path: file }));
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
