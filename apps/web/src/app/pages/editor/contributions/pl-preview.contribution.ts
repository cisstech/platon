import { Injectable, Injector, NgModule } from '@angular/core';
import {
  CONTRIBUTION, IContribution,
  Preview,
  PreviewHandler,
  PreviewService,
  PreviewTypes
} from '@cisstech/nge-ide/core';
import { Subscription } from 'rxjs';


@Injectable()
export class Contribution implements IContribution {
  private readonly subscriptions: Subscription[] = [];
  readonly id = 'platon.contrib.preview';

  activate(injector: Injector) {
    const previewService = injector.get(PreviewService);
    previewService.register(new (class implements PreviewHandler {
      private counter = 0; // temporary solution to trigger change detection of the preview editor
      canHandle(uri: monaco.Uri) {
        return uri.path === '/main.ple' || uri.path === '/main.pla';
      }

      async handle(_: Injector, uri: monaco.Uri): Promise<Preview> {
        const [resource, version] = uri.authority.split(':');
        return Promise.resolve({
          type: PreviewTypes.URL,
          data: `/player/preview/${resource}?version=${version}&counter=${++this.counter}`,
        });
      }
    })())

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
export class PlPreviewContributionModule { }
