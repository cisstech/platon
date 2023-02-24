import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  Input,
} from '@angular/core';
import { WebComponent, WebComponentHooks } from '../../web-component';
import { PickerComponentDefinition, PickerState } from './picker';

@Component({
  selector: 'wc-picker',
  templateUrl: 'picker.component.html',
  styleUrls: ['picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(PickerComponentDefinition)
export class PickerComponent implements WebComponentHooks<PickerState> {
  @Input() state!: PickerState;
  constructor(readonly injector: Injector) {}
}
