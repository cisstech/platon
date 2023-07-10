import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import {
  CheckboxGroupComponentDefinition,
  CheckboxGroupState,
  CheckboxItem,
} from './checkbox-group'

@Component({
  selector: 'wc-checkbox-group',
  templateUrl: 'checkbox-group.component.html',
  styleUrls: ['checkbox-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(CheckboxGroupComponentDefinition)
export class CheckboxGroupComponent implements WebComponentHooks<CheckboxGroupState> {
  @Input() state!: CheckboxGroupState

  constructor(readonly injector: Injector) {}

  onChangeState() {
    if (!Array.isArray(this.state.items)) {
      this.state.items = []
    }
    this.state.items.forEach((item, index) => {
      if (typeof item === 'string') {
        item = this.state.items[index] = {
          content: item,
          checked: false,
        }
      }
      if (item.checked == null) {
        item.checked = false
      }
    })
  }

  trackBy(index: number, item: CheckboxItem) {
    return item.content || index
  }
}
