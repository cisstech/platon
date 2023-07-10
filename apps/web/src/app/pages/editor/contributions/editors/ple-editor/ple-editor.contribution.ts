import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, ICommand, IContribution } from '@cisstech/nge-ide/core'
import { CodIcon } from '@cisstech/nge/ui/icon'
import { Subscription } from 'rxjs'
import { EditorPresenter } from '../../../editor.presenter'
import { PleEditor } from './ple-editor'

@Injectable()
export class Contribution implements IContribution {
  private readonly subscriptions: Subscription[] = []
  readonly id = 'platon.contrib.ple'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PleEditor())
    const presenter = injector.get(EditorPresenter)

    editorService.registerCommands(
      new (class implements ICommand {
        readonly id = 'platon.contrib.ple.commands.designer-open'
        readonly label = 'Mode design'
        readonly icon = new CodIcon('screen-normal')
        get enabled(): boolean {
          const { activeResource } = editorService
          if (!activeResource) return false

          const { path, query, authority } = activeResource
          if (!authority.startsWith(presenter.currentResource.id)) return false

          return '/main.ple' === path && !query.includes('designer')
        }
        async execute(): Promise<void> {
          const { activeResource } = editorService
          if (!activeResource) return
          editorService.close(activeResource)
          editorService.open(
            activeResource.with({
              query: `designer=true`,
            })
          )
        }
      })()
    )

    editorService.registerCommands(
      new (class implements ICommand {
        readonly id = 'platon.contrib.ple.commands.designer-close'
        readonly label = 'Mode code'
        readonly icon = new CodIcon('code')
        get enabled(): boolean {
          const { activeResource } = editorService
          if (!activeResource) return false

          const { path, query, authority } = activeResource
          if (!authority.startsWith(presenter.currentResource.id)) return false

          return '/main.ple' === path && query.includes('designer')
        }
        async execute(): Promise<void> {
          const { activeResource } = editorService
          if (!activeResource) return
          editorService.close(activeResource)
          editorService.open(
            activeResource.with({
              query: '',
            })
          )
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
export class PleEditorContributionModule {}
