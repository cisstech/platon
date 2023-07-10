import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { MarkdownComponentDefinition, MarkdownState } from './markdown'

@Component({
  selector: 'wc-markdown',
  templateUrl: 'markdown.component.html',
  styleUrls: ['markdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(MarkdownComponentDefinition)
export class MarkdownComponent implements WebComponentHooks<MarkdownState> {
  @Input() state!: MarkdownState
  constructor(readonly injector: Injector) {}
}
