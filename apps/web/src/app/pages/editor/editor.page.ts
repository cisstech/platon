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
import { EditorService, FileService, IdeService, SettingsService, MonacoService } from '@cisstech/nge-ide/core'
import { DialogModule, IntroService } from '@platon/core/browser'
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
import { ACTIVITY_MAIN_FILE, TEMPLATE_OVERRIDE_FILE } from '@platon/feature/compiler'
import { Title } from '@angular/platform-browser'
import { Resource } from '@platon/feature/resource/common'

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

    DialogModule,
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
  private readonly settingsService = inject(SettingsService)
  private readonly monacoService = inject(MonacoService)
  private readonly title = inject(Title)
  protected loading = true
  protected isReady = false

  private registeredFolders: { id: string }[] = [] // this list is used to check whether a folder is already opened, not intended to be used for anything else

  async ngOnInit(): Promise<void> {
    const { resource, version, rootFolders, filesToOpen } = await this.presenter.init(this.activatedRoute)
    this.title.setTitle(resource.name)

    this.subscriptions.push(
      this.ide.onAfterStart(async () => {
        this.updateFileToOpen(filesToOpen, resource)
        this.fileService.registerProvider(this.resourceFileSystemProvider)
        await this.fileService.registerFolders(...rootFolders())
        this.registeredFolders.push({ id: resource.id })
        filesToOpen.forEach((path) => {
          this.editorService
            .open(this.resourceFileSystemProvider.buildUri(resource.id, version, path))
            .catch(console.error)
        })

        this.loading = false
        this.changeDetectorRef.markForCheck()

        this.monacoService.onDidFollowLink.subscribe(async (clickedLink) => {
          const [id, version] = clickedLink.uri.authority.split(':')
          if (this.registeredFolders.some((f) => f.id === id)) {
            return
          }
          await this.fileService.registerFolders(await this.presenter.getNewResourceFolder(id, version))
          this.registeredFolders.push({ id })
        })
      })
    )
    this.isReady = true
    this.changeDetectorRef.markForCheck()
  }

  ngOnDestroy(): void {
    this.resourceFileSystemProvider.cleanUp()
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  private updateFileToOpen(filesToOpen: string[], resource: Resource): void {
    if (filesToOpen.length === 0) {
      if (resource.type === 'ACTIVITY') {
        this.settingsService.set('ide.layout', 'toggleSideBar', 'closed')
        filesToOpen.push(ACTIVITY_MAIN_FILE)
        return
      }
      if (resource.type === 'EXERCISE' && resource.templateId) {
        this.settingsService.set('ide.layout', 'toggleSideBar', 'closed')
        filesToOpen.push(TEMPLATE_OVERRIDE_FILE)
        return
      }
    }
    this.settingsService.set('ide.layout', 'toggleSideBar', 'opened')
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
