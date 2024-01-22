import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, IContribution } from '@cisstech/nge-ide/core'
import { PlcEditor } from './plc-editor'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.plc-editor'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PlcEditor())
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
export class PlcEditorContributionModule {}
