import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Output } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentService } from '../../web-component.service'
import { RadioGroupComponentDefinition, RadioGroupItem, RadioGroupState } from './radio-group'

@Component({
  selector: 'wc-radio-group',
  templateUrl: 'radio-group.component.html',
  styleUrls: ['radio-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(RadioGroupComponentDefinition)
export class RadioGroupComponent implements WebComponentHooks<RadioGroupState> {
  private readonly webComponentService!: WebComponentService

  @Input() state!: RadioGroupState
  @Output() stateChange = new EventEmitter<RadioGroupState>()

  constructor(readonly injector: Injector) {
    this.webComponentService = injector.get(WebComponentService)!
  }

  onChangeState() {
    if (!Array.isArray(this.state.items)) {
      this.state.items = []
    }

    this.state.items.forEach((item, index) => {
      if (typeof item === 'string') {
        this.state.items[index] = {
          content: item,
        }
      }
    })
  }

  trackBy(index: number, item: RadioGroupItem) {
    return item.content || index
  }

  protected autoValidate() {
    if (this.state.autoValidation && this.state.selection) {
      this.webComponentService.submit(this)
    }
  }
}
