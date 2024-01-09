import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, IContribution } from '@cisstech/nge-ide/core'
import { PlaEditor } from './pla-editor'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.pla'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PlaEditor())
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
export class PlaEditorContributionModule {}
