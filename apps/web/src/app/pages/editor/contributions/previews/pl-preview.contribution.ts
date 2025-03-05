import { Injectable, Injector, NgModule } from '@angular/core'
import {
  CONTRIBUTION,
  CommandService,
  EditorService,
  FileService,
  ICommand,
  IContribution,
  KeyCodes,
  KeyModifiers,
  Keybinding,
  Preview,
  PreviewHandler,
  PreviewService,
  PreviewTypes,
  ToolbarService,
} from '@cisstech/nge-ide/core'
import { CodIcon } from '@cisstech/nge/ui/icon'
import { ACTIVITY_MAIN_FILE, EXERCISE_MAIN_FILE } from '@platon/feature/compiler'
import { PLAYER_EDITOR_PREVIEW } from '@platon/feature/player/browser'
import { ResourceTypes } from '@platon/feature/resource/common'
import { Subscription } from 'rxjs'
import { EditorPresenter } from '../../editor.presenter'
import { PLATON_SCHEME, ResourceFileSystemProvider } from '../file-system'

const canPreviewUri = (uri: monaco.Uri, owner: { type: ResourceTypes }) => {
  if (!owner || owner.type === 'CIRCLE') return false
  return uri.path === `/${EXERCISE_MAIN_FILE}` || uri.path === `/${ACTIVITY_MAIN_FILE}`
}

const buildPreviewUrl = (uri: monaco.Uri, params?: string[]) => {
  const [resource, version] = uri.authority.split(':')
  const queryParams = params ? '&' + params?.join('&') : ''
  return `/player/preview/${resource}?version=${version}${queryParams}`
}

const buildPreview = (uri: monaco.Uri): Preview => ({
  type: PreviewTypes.URL,
  data: buildPreviewUrl(uri, [`timestamp=${Date.now()}`, PLAYER_EDITOR_PREVIEW]), // Add timestamp to avoid cache, might be changed later
})

class PreviewInNewTabCommand implements ICommand {
  readonly id = 'platon.contrib.ple.commands.preview-in-new-tab'
  readonly label = 'Prévisualiser dans un nouvel onglet'
  readonly icon = new CodIcon('browser')

  constructor(private readonly presenter: EditorPresenter, private readonly editorService: EditorService) {}

  get enabled(): boolean {
    const { activeResource } = this.editorService
    if (!activeResource) return false
    const { owner } = this.presenter.findOwnerResource(activeResource)
    if (!owner) return false
    return canPreviewUri(activeResource, owner)
  }

  async execute(): Promise<void> {
    const { activeResource } = this.editorService
    if (!activeResource) return

    window.open(buildPreviewUrl(activeResource), '_blank')
  }
}

class ToolbarPreviewCommand implements ICommand {
  readonly id = 'platon.contrib.toolbar.commands.preview'
  readonly label = 'Prévisualiser'
  readonly icon = new CodIcon('play-circle')
  readonly keybinding = new Keybinding({
    key: KeyCodes.ENTER,
    label: '⌘ ENTER',
    modifiers: [KeyModifiers.CTRL_CMD],
  })

  constructor(
    private readonly presenter: EditorPresenter,
    private readonly fileService: FileService,
    private readonly editorService: EditorService
  ) {}
  get enabled(): boolean {
    const { currentResource } = this.presenter
    if (!currentResource) return false
    return currentResource.type !== 'CIRCLE'
  }

  async execute(): Promise<void> {
    const { currentVersion, currentResource } = this.presenter
    if (!currentResource) return
    const fs = this.fileService.getProvider(PLATON_SCHEME) as ResourceFileSystemProvider
    const uri = fs
      .buildUri(
        currentResource.id,
        currentVersion,
        currentResource.type === ResourceTypes.EXERCISE ? EXERCISE_MAIN_FILE : ACTIVITY_MAIN_FILE
      )
      .with({
        query: PLAYER_EDITOR_PREVIEW,
      })
    this.editorService
      .saveAll()
      .then(() => {
        this.editorService
          .open(uri, {
            preview: buildPreview(uri),
          })
          .catch(console.error)
      })
      .catch(console.error)
  }
}

export class ResourceCommand implements ICommand {
  readonly id = 'platon.contrib.toolbar.commands.resource'
  readonly label = 'Ressource'
  readonly icon = new CodIcon('link-external')

  constructor(private readonly presenter: EditorPresenter) {}

  get enabled(): boolean {
    const { currentResource } = this.presenter
    if (!currentResource) return false
    return true
  }

  async execute(): Promise<void> {
    window.open('resources/' + this.presenter.currentResource.id, '_blank')
  }
}

@Injectable()
export class Contribution implements IContribution {
  private readonly subscriptions: Subscription[] = []
  readonly id = 'platon.contrib.preview'

  activate(injector: Injector) {
    const presenter = injector.get(EditorPresenter)
    const fileService = injector.get(FileService)
    const editorService = injector.get(EditorService)
    const previewService = injector.get(PreviewService)
    const toolbarService = injector.get(ToolbarService)
    const commandService = injector.get(CommandService)

    previewService.register(
      new (class implements PreviewHandler {
        canHandle(uri: monaco.Uri): boolean {
          const { currentResource } = presenter
          if (!currentResource) return false
          const { owner } = presenter.findOwnerResource(uri)
          if (!owner) return false
          return canPreviewUri(uri, owner)
        }

        async handle(_: Injector, uri: monaco.Uri): Promise<Preview> {
          return Promise.resolve(buildPreview(uri))
        }
      })()
    )

    editorService.registerCommands(new PreviewInNewTabCommand(presenter, editorService))

    const previewFromToolbar = new ToolbarPreviewCommand(presenter, fileService, editorService)
    const resourceCommand = new ResourceCommand(presenter)

    commandService.register(previewFromToolbar)
    toolbarService.registerButton({
      command: previewFromToolbar,
      colors: {
        foreground: 'white',
        background: 'var(--brand-color-primary)',
      },
    })

    toolbarService.registerButton({
      command: resourceCommand,
      buttonType: 'text',
      colors: {
        foreground: 'white',
        background: 'transparent',
      },
    })
  }

  deactivate(): void | Promise<void> {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}

@NgModule({
  providers: [
    {
      provide: CONTRIBUTION,
      multi: true,
      useClass: Contribution,
    },
  ],
})
export class PlPreviewContributionModule {}
