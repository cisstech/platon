import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'

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
import { IntroService } from '@platon/core/browser'
import { fadeInOnEnterAnimation, fadeOutDownOnLeaveAnimation } from 'angular-animations'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { Subscription } from 'rxjs'
import { PdfEditorContributionModule } from './contributions/editors/pdf-editor'
import { PlcEditorContributionModule } from './contributions/editors/plc-editor'
import { PleEditorContributionModule } from './contributions/editors/ple-editor'
import { PloEditorContributionModule } from './contributions/editors/plo-editor'
import { ZipEditorContributionModule } from './contributions/editors/zip-editor'
import { PlExplorerContributionModule } from './contributions/explorer/pl-explorer.contribution'
import { ResourceFileSystemProvider } from './contributions/file-system'
import { PlPreviewContributionModule } from './contributions/previews/pl-preview.contribution'
import { PlSidebarContributionModule } from './contributions/sidebar/pl-sidebar.contribution'
import { PlWorkbenchContributionModule } from './contributions/workbench/pl-workbench.contribution'
import { EDITOR_TOUR } from './editor-tour'
import { EditorPresenter } from './editor.presenter'

@Component({
  standalone: true,
  selector: 'app-resource-editor',
  templateUrl: './editor.page.html',
  styleUrls: ['./editor.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOnEnterAnimation(), fadeOutDownOnLeaveAnimation({ duration: 500 })],
  imports: [
    CommonModule,

    NzSpinModule,
    NzButtonModule,
    NzSkeletonModule,

    NgeIdeModule,
    NgeIdeExplorerModule,
    NgeIdeSearchModule,
    NgeIdeSettingsModule,

    NgeIdeProblemsModule,
    NgeIdeNotificationsModule,

    PdfEditorContributionModule,
    PlfEditorContributionModule,
    PlaEditorContributionModule,
    PlPreviewContributionModule,
    PleEditorContributionModule,
    PlExplorerContributionModule,
    PlWorkbenchContributionModule,
    PlSidebarContributionModule,
    PlcEditorContributionModule,
    PloEditorContributionModule,
    ZipEditorContributionModule,
  ],
})
export class EditorPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []

  private readonly ide = inject(IdeService)
  private readonly presenter = inject(EditorPresenter)
  private readonly fileService = inject(FileService)
  private readonly introService = inject(IntroService)
  private readonly editorService = inject(EditorService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly resourceFileSystemProvider = inject(ResourceFileSystemProvider)
  protected loading = true
  protected isReady = false

  async ngOnInit(): Promise<void> {
    const { resource, version, rootFolders, filesToOpen } = await this.presenter.init(this.activatedRoute)
    this.subscriptions.push(
      this.ide.onAfterStart(async () => {
        this.fileService.registerProvider(this.resourceFileSystemProvider)
        await this.fileService.registerFolders(...rootFolders())
        filesToOpen.forEach((path) => {
          this.editorService
            .open(this.resourceFileSystemProvider.buildUri(resource.id, version, path))
            .catch(console.error)
        })
        this.loading = false
        this.changeDetectorRef.markForCheck()
      })
    )
    this.isReady = true
    this.changeDetectorRef.markForCheck()
  }

  ngOnDestroy(): void {
    this.resourceFileSystemProvider.cleanUp()
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async introTour(): Promise<void> {
    const intro = await this.introService.create()

    intro.setOptions({
      scrollToElement: true,
      disableInteraction: true,
      showButtons: true,
      showBullets: false,
      showStepNumbers: false,
      showProgress: true,
      doneLabel: 'Terminer',
      nextLabel: 'Suivant',
      skipLabel: 'X',
      prevLabel: 'Précedent',
      steps: EDITOR_TOUR,
    })

    intro.start()
  }
}
