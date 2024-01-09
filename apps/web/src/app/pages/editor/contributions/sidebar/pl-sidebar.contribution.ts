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

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.sidebar'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    const viewContainerService = injector.get(ViewContainerService)

    viewContainerService.register(
      new (class extends SidebarContainer {
        readonly id = 'platon.container.docs'
        readonly title = 'Documentation'
        readonly icon = new CodIcon('book')
        readonly side = 'left'
        readonly align = 'bottom'

        readonly dropdown = [
          {
            label: 'Éditeur',
            action: () => {
              editorService.open(monaco.Uri.parse('docs://embed'), {
                preview: {
                  type: PreviewTypes.URL,
                  data: 'docs/main/doc/programing/ide',
                },
                title: 'Documentation',
              })
            },
          },
          {
            label: 'Composants',
            action: () => {
              editorService.open(monaco.Uri.parse('docs://embed'), {
                preview: {
                  type: PreviewTypes.URL,
                  data: 'docs/components',
                },
                title: 'Documentation',
              })
            },
          },
          {
            label: 'Guide de programmation',
            action: () => {
              editorService.open(monaco.Uri.parse('docs://embed'), {
                preview: {
                  type: PreviewTypes.URL,
                  data: 'docs/main/doc/programing/exercise/langage',
                },
                title: 'Documentation',
              })
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