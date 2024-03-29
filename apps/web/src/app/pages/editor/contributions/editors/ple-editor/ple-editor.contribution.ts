import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, ICommand, IContribution } from '@cisstech/nge-ide/core'
import { CodIcon } from '@cisstech/nge/ui/icon'
import { EXERCISE_MAIN_FILE } from '@platon/feature/compiler'
import { EditorPresenter } from '../../../editor.presenter'
import { PleEditor } from './ple-editor'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.ple'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PleEditor())
    const presenter = injector.get(EditorPresenter)

    editorService.registerCommands(
      new (class implements ICommand {
        readonly id = 'platon.contrib.ple.commands.designer-open'
        readonly label = 'Designer'
        readonly icon = new CodIcon('screen-normal')
        get enabled(): boolean {
          const { activeResource, activeEditor } = editorService
          if (activeEditor?.options?.preview) return false

          if (!activeResource) return false

          const { path, query, authority } = activeResource
          if (!authority.startsWith(presenter.currentResource.id)) return false

          return `/${EXERCISE_MAIN_FILE}` === path && !query.includes('designer')
        }
        async execute(): Promise<void> {
          const { activeResource } = editorService
          if (!activeResource) return
          editorService.close(activeResource).catch(console.error)
          editorService
            .open(
              activeResource.with({
                query: `designer=true`,
              })
            )
            .catch(console.error)
        }
      })()
    )

    editorService.registerCommands(
      new (class implements ICommand {
        readonly id = 'platon.contrib.ple.commands.designer-close'
        readonly label = 'Code'
        readonly icon = new CodIcon('code')
        get enabled(): boolean {
          const { activeResource, activeEditor } = editorService
          if (activeEditor?.options?.preview) return false

          if (!activeResource) return false

          const { path, query, authority } = activeResource
          if (!authority.startsWith(presenter.currentResource.id)) return false

          return `/${EXERCISE_MAIN_FILE}` === path && query.includes('designer')
        }
        async execute(): Promise<void> {
          const { activeResource } = editorService
          if (!activeResource) return
          editorService.close(activeResource).catch(console.error)
          editorService
            .open(
              activeResource.with({
                query: '',
              })
            )
            .catch(console.error)
        }
      })()
    )
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
