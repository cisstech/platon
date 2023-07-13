/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core'

import { NgeIdeModule } from '@cisstech/nge-ide'
import { NgeIdeExplorerModule } from '@cisstech/nge-ide/explorer'
import { NgeIdeNotificationsModule } from '@cisstech/nge-ide/notifications'
import { NgeIdeProblemsModule } from '@cisstech/nge-ide/problems'
import { NgeIdeSearchModule } from '@cisstech/nge-ide/search'
import { NgeIdeSettingsModule } from '@cisstech/nge-ide/settings'

import { PlaEditorContributionModule } from './contributions/editors/pla-editor'
import { PlfEditorContributionModule } from './contributions/editors/plf-editor'

import { ActivatedRoute } from '@angular/router'
import { EditorService, FileService, IdeService } from '@cisstech/nge-ide/core'
import { Subscription } from 'rxjs'
import { PleConfigEditorContributionModule } from './contributions/editors/ple-config-editor'
import { PleEditorContributionModule } from './contributions/editors/ple-editor'
import { ResourceFileSystemProvider } from './contributions/file-system'
import { PlPreviewContributionModule } from './contributions/previews/pl-preview.contribution'
import { EditorPresenter } from './editor.presenter'

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
    PleEditorContributionModule,
    PleConfigEditorContributionModule,
  ],
  providers: [ResourceFileSystemProvider],
})
export class EditorPage implements OnInit, OnDestroy {
  private readonly ide = inject(IdeService)
  private readonly presenter = inject(EditorPresenter)
  private readonly fileService = inject(FileService)
  private readonly editorService = inject(EditorService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly resourceFileSystemProvider = inject(ResourceFileSystemProvider)

  private subscription?: Subscription

  async ngOnInit(): Promise<void> {
    const { resource, version, ancestors, filesToOpen } = await this.presenter.init(this.activatedRoute)
    this.subscription = this.ide.onAfterStart(async () => {
      this.fileService.registerProvider(this.resourceFileSystemProvider)
      await this.fileService.registerFolders(
        {
          name: `${resource.name}#${version}`,
          uri: this.resourceFileSystemProvider.buildUri(resource.id, version),
        },
        ...ancestors.map((ancestor) => ({
          name: `@${ancestor.code}#latest`,
          uri: this.resourceFileSystemProvider.buildUri(ancestor.code || ancestor.id),
        }))
      )

      filesToOpen.forEach((path) => {
        this.editorService.open(this.resourceFileSystemProvider.buildUri(resource.id, version, path))
      })
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }
}
