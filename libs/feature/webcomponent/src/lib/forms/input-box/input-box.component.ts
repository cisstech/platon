import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { Observable, Subscription } from 'rxjs'
import { debounceTime, map, startWith } from 'rxjs/operators'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { InputBoxComponentDefinition, InputBoxState } from './input-box'

@Component({
  selector: 'wc-input-box',
  templateUrl: 'input-box.component.html',
  styleUrls: ['input-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(InputBoxComponentDefinition)
export class InputBoxComponent implements OnInit, OnDestroy, WebComponentHooks<InputBoxState> {
  @Input() state!: InputBoxState
  @Output() stateChange = new EventEmitter<InputBoxState>()

  private subscription?: Subscription

  protected containerStyles: Record<string, string> = {}

  protected readonly form = new FormControl()

  protected readonly $autocomplete: Observable<string[]> = this.form.valueChanges.pipe(
    startWith(''),
    map((value) => this.getSuggestions(value))
  )

  constructor(readonly injector: Injector) {}

  ngOnInit() {
    this.subscription = this.form.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      value = value || ''
      if (this.state.type === 'number') {
        value = ('' + value).replace(/,/g, '.')
        value = value === '-' ? '-' : Number.parseFloat(value) || 0
      }

      if (this.state.value !== value) {
        this.state.value = value
      }
    })
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe()
  }

  onChangeState() {
    this.form.setValue(this.state.value, {
      emitEvent: false,
    })

    this.form.enable({ emitEvent: false })
    if (this.state.disabled) {
      this.form.disable({ emitEvent: false })
    }

    this.containerStyles = {}
    if (this.state.width) {
      this.containerStyles['width'] = this.state.width
    }
  }

  private getSuggestions(value: string): string[] {
    if (!value) {
      return []
    }

    const convert = (v: string) => {
      return (v + '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
    }

    value = convert(value)

    return this.state.completion.filter((option) => {
      return convert(option).includes(value)
    })
  }
}
