import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, IContribution } from '@cisstech/nge-ide/core'
import { PlfEditor } from './plf-editor'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.plf'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PlfEditor())
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
export class PlfEditorContributionModule {}
