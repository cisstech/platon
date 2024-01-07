import { Injectable, Injector, NgModule } from '@angular/core'
import { CONTRIBUTION, EditorService, IContribution } from '@cisstech/nge-ide/core'
import { Subscription } from 'rxjs'
import { PleConfigEditor } from './plc-editor'

@Injectable()
export class Contribution implements IContribution {
  private readonly subscriptions: Subscription[] = []
  readonly id = 'platon.contrib.plc-editor'

  activate(injector: Injector) {
    const editorService = injector.get(EditorService)
    editorService.registerEditors(new PleConfigEditor())
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
export class PlcEditorContributionModule {}
