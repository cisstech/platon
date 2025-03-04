import { Injectable, Injector, NgModule } from '@angular/core'
import {
  CONTRIBUTION,
  EditorService,
  IContribution,
  PreviewTypes,
  SidebarContainer,
  ViewContainerService,
} from '@cisstech/nge-ide/core'
import { CodIcon } from '@cisstech/nge/ui/icon'

export const DOCS_CONTAINER_ID = 'platon.container.docs'
@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.sidebar'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    const viewContainerService = injector.get(ViewContainerService)

    viewContainerService.register(
      new (class extends SidebarContainer {
        readonly id = DOCS_CONTAINER_ID
        readonly title = 'Documentation'
        readonly icon = new CodIcon('book')
        readonly side = 'left'
        readonly align = 'bottom'

        readonly dropdown = [
          {
            label: 'Éditeur',
            action: () => {
              editorService
                .open(monaco.Uri.parse('docs://embed'), {
                  preview: {
                    type: PreviewTypes.URL,
                    data: 'docs/main/programing/ide',
                  },
                  title: 'Documentation',
                })
                .catch(console.error)
            },
          },
          {
            label: 'Composants',
            action: () => {
              editorService
                .open(monaco.Uri.parse('docs://embed'), {
                  preview: {
                    type: PreviewTypes.URL,
                    data: 'docs/components',
                  },
                  title: 'Documentation',
                })
                .catch(console.error)
            },
          },
          {
            label: 'Guide de programmation',
            action: () => {
              editorService
                .open(monaco.Uri.parse('docs://embed'), {
                  preview: {
                    type: PreviewTypes.URL,
                    data: 'docs/main/programing/exercise/langage',
                  },
                  title: 'Documentation',
                })
                .catch(console.error)
            },
          },
        ]
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
export class PlSidebarContributionModule {}
