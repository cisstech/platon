import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { FoldableFeedbackComponentDefinition, FoldableFeedbackState } from './foldable-feedback'

@Component({
  selector: 'wc-foldable-feedback',
  templateUrl: 'foldable-feedback.component.html',
  styleUrls: ['foldable-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(FoldableFeedbackComponentDefinition)
export class FoldableFeedbackComponent implements WebComponentHooks<FoldableFeedbackState> {
  @Input() state!: FoldableFeedbackState

  constructor(readonly injector: Injector) {}

  onClick(index: number) {
    this.state.content[index].display = !this.state.content[index].display
  }
}
