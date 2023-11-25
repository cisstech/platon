import { Injectable, Injector, NgModule } from '@angular/core'
import {
  CONTRIBUTION,
  EditorService,
  ICommand,
  IContribution,
  Preview,
  PreviewHandler,
  PreviewService,
  PreviewTypes,
} from '@cisstech/nge-ide/core'
import { CodIcon } from '@cisstech/nge/ui/icon'
import { PLAYER_FULLSCREEN } from '@platon/feature/player/browser'
import { Subscription } from 'rxjs'
import { EditorPresenter } from '../../editor.presenter'

@Injectable()
export class Contribution implements IContribution {
  private readonly subscriptions: Subscription[] = []
  readonly id = 'platon.contrib.preview'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    const previewService = injector.get(PreviewService)
    const presenter = injector.get(EditorPresenter)

    const canPreviewUri = (uri: monaco.Uri) => {
      const { owner } = presenter.findOwnerResource(uri)
      if (!owner || owner.type === 'CIRCLE') return false
      return uri.path === '/main.ple' || uri.path === '/main.pla'
    }

    const buildPreviewUrl = (uri: monaco.Uri, params?: string[]) => {
      const [resource, version] = uri.authority.split(':')
      const queryParams = params ? '&' + params?.join('&') : ''
      return `/player/preview/${resource}?version=${version}${queryParams}`
    }

    previewService.register(
      new (class implements PreviewHandler {
        private counter = 0 // temporary solution to trigger change detection of the preview editor
        canHandle = canPreviewUri

        async handle(_: Injector, uri: monaco.Uri): Promise<Preview> {
          return Promise.resolve({
            type: PreviewTypes.URL,
            data: buildPreviewUrl(uri, [`counter=${++this.counter}`, PLAYER_FULLSCREEN]),
          })
        }
      })()
    )

    editorService.registerCommands(
      new (class implements ICommand {
        readonly id = 'platon.contrib.ple.commands.preview-in-new-tab'
        readonly label = 'Prévisualiser dans un nouvel onglet'
        readonly icon = new CodIcon('browser')

        get enabled(): boolean {
          const { activeResource } = editorService
          if (!activeResource) return false
          return canPreviewUri(activeResource)
        }

        async execute(): Promise<void> {
          const { activeResource } = editorService
          if (!activeResource) return

          window.open(buildPreviewUrl(activeResource), '_blank')
        }
      })()
    )
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
