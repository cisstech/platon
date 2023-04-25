import { Injectable, Injector, NgModule } from '@angular/core';
import {
  CONTRIBUTION,
  EditorService, IContribution
} from '@cisstech/nge-ide/core';
import { Subscription } from 'rxjs';
import { PlaEditor } from './pla-editor';


@Injectable()
export class Contribution implements IContribution {
  private readonly subscriptions: Subscription[] = [];
  readonly id = 'platon.contrib.pla';

  activate(injector: Injector) {
    const editorService = injector.get(EditorService);
    editorService.registerEditors(
      new PlaEditor()
    );
  }

  deactivate(): void | Promise<void> {
    this.subscriptions.forEach(s => s.unsubscribe());
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
export class PlaEditorContributionModule { }
