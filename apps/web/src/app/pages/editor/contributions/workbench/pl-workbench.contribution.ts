import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, FileService, IContribution, NotificationService } from '@cisstech/nge-ide/core'
import { EditorPresenter } from '../../editor.presenter'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.workbench'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    const fileService = injector.get(FileService)
    const notificationService = injector.get(NotificationService)
    editorService.registerDropInEditorHandler(async (uri) => {
      const presenter = injector.get(EditorPresenter)
      const { activeResource } = editorService
      if (!activeResource) {
        return []
      }

      let path = ''
      try {
        path = presenter.resolvePath(uri, activeResource)
        if (!path) {
          return []
        }
      } catch (error) {
        notificationService.publishError(error)
        return []
      }

      const file = await fileService.find(uri)
      const { origin } = location
      return [
        { label: 'Insérer un @copyurl', value: `@copyurl ${path}` },
        { label: 'Insérer un @copycontent', value: `@copycontent ${path}` },
        { label: 'Insérer un chemin de fichier', value: path },
        ...(file?.url ? [{ label: 'Insérer un lien de téléchargement', value: origin + file.url }] : []),
      ]
    })
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
export class PlWorkbenchContributionModule {}
