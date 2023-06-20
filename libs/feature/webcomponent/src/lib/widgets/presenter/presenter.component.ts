import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import { PresenterComponentDefinition, PresenterState } from './presenter';

@Component({
  selector: 'wc-presenter',
  templateUrl: 'presenter.component.html',
  styleUrls: ['presenter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(PresenterComponentDefinition)
export class PresenterComponent implements WebComponentHooks<PresenterState> {
  @Input() state!: PresenterState;
  constructor(readonly injector: Injector) {}
}
