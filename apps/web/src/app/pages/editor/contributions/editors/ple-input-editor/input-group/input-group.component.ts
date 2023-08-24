import { ChangeDetectionStrategy, Component, Input, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { PleInput } from '../ple-input'

@Component({
  selector: 'app-editor-input-group',
  templateUrl: 'input-group.component.html',
  styleUrls: ['input-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputGroupComponent),
      multi: true,
    },
  ],
})
export class InputGroupComponent implements ControlValueAccessor {
  @Input() disabled? = false
  @Input() reservedNames: string[] = []

  protected inputs: PleInput[] = []
  protected selection?: PleInput
  protected selectionIndex = -1

  // ControlValueAccessor methods

  onChange: (value: unknown) => void = () => {
    //
  }

  onTouched: () => void = () => {
    //
  }

  writeValue(value: PleInput[]): void {
    this.inputs = value
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState?(disabled: boolean): void {
    this.disabled = disabled
  }

  protected add(): void {
    this.inputs = [
      ...this.inputs,
      {
        name: `var${this.inputs.length - 1}`,
        type: 'text',
        value: '',
      } as PleInput,
    ]
  }

  protected update(change: PleInput): void {
    this.inputs = this.inputs.map((v, i) => (i === this.selectionIndex ? change : v))
    this.notifyChange()
  }

  protected selectAt(index: number): void {
    this.selectionIndex = index
    this.selection = this.inputs[index]
  }

  protected deleteAt(index: number): void {
    this.inputs.splice(index, 1)
    this.selection = undefined
    this.selectionIndex = -1
    this.notifyChange()
  }

  protected trackFn(index: number, input: PleInput) {
    return input.name || index
  }

  private notifyChange(): void {
    this.onChange(this.inputs)
  }
}
