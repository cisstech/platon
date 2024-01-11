import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, IContribution } from '@cisstech/nge-ide/core'
import { PdfEditor } from './pdf-editor'

@Injectable()
export class Contribution implements IContribution {
  readonly id = 'platon.contrib.pdf'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PdfEditor())
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
export class PdfEditorContributionModule {}
