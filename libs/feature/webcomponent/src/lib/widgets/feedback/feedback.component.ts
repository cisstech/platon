import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import {
  FeedbackComponentDefinition, FeedbackState,
} from './feedback';

@Component({
  selector: 'wc-feedback',
  templateUrl: 'feedback.component.html',
  styleUrls: ['feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(FeedbackComponentDefinition)
export class FeedbackComponent implements WebComponentHooks<FeedbackState>
{
  @Input() state!: FeedbackState;
  constructor(readonly injector: Injector) { }
}
