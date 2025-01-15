import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Output, OnInit } from '@angular/core'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { PickerComponentDefinition, PickerState } from './picker'

@Component({
  selector: 'wc-picker',
  templateUrl: 'picker.component.html',
  styleUrls: ['picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(PickerComponentDefinition)
export class PickerComponent implements WebComponentHooks<PickerState>, OnInit {
  @Input() state!: PickerState
  @Output() stateChange = new EventEmitter<PickerState>()

  constructor(readonly injector: Injector) {}

  ngOnInit() {
    this.state.isFilled = false
  }
}
