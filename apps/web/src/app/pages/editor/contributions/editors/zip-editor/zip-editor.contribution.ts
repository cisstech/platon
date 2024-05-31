import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, IContribution } from '@cisstech/nge-ide/core'
import { ZipEditor } from './zip-editor'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.zip'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new ZipEditor())
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
export class ZipEditorContributionModule {}
