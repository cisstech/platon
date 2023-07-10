import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { Subscription, debounceTime, skip, tap } from 'rxjs'
import { InputBooleanProvider } from './input-boolean'
import { InputCodeProvider } from './input-code'
import { InputJsonProvider } from './input-json'
import { InputNumberProvider } from './input-number'
import { InputTextProvider } from './input-text'
import {
  CONFIG_EDITOR_TOKEN,
  PLE_INPUT_PROVIDERS,
  PleInput,
  PleInputConfigEditor,
  PleInputProvider,
  PleInputValueEditor,
  VALUE_EDITOR_TOKEN,
} from './ple-input'

@Component({
  selector: 'app-ple-input',
  templateUrl: './ple-input.component.html',
  styleUrls: ['./ple-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // THE ORDER IS IMPORTANT SINCE THE `canHandle` METHOD IS CALLED IN THE SAME ORDER
    InputNumberProvider,
    InputBooleanProvider,
    InputJsonProvider,
    InputCodeProvider, // string is always handled by code editor
    InputTextProvider,
  ],
})
export class PleInputComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder)
  private readonly injector = inject(Injector)
  private readonly subscriptions: Subscription[] = []

  private valueEditor?: PleInputValueEditor
  private configEditor?: PleInputConfigEditor

  readonly configForm = this.fb.group({
    name: [''],
    type: [''],
    description: [''],
    value: [{} as unknown],
    options: [{} as unknown],
  })

  readonly providers: ReadonlyArray<Readonly<PleInputProvider>> =
    inject(PLE_INPUT_PROVIDERS, {
      optional: true,
    }) || []

  readonly sortedProviders = [...this.providers].sort((a, b) => a.label.localeCompare(b.label))

  protected selectedProvider?: PleInputProvider

  protected readonly configEditorInjector = Injector.create({
    providers: [
      {
        provide: CONFIG_EDITOR_TOKEN,
        useValue: (instance: PleInputConfigEditor) => {
          this.configEditor = instance
          instance.setOptions(this.input.options)
          instance.onChangeOptions((options) => {
            setTimeout(() => {
              this.input.options = options
              this.inputChange.emit(this.input)
            }, 300)
          })
        },
      },
    ],
    parent: this.injector,
  })

  protected readonly valueEditorInjector = Injector.create({
    providers: [
      {
        provide: VALUE_EDITOR_TOKEN,
        useValue: (instance: PleInputValueEditor) => {
          this.valueEditor = instance
          instance.setValue(this.input.value)
          instance.setOptions?.(this.input.options)
          instance.onChangeValue((value) => {
            setTimeout(() => {
              this.input = {
                ...this.input,
                value,
              }
              this.inputChange.emit(this.input)
            }, 300)
          })
        },
      },
    ],
    parent: this.injector,
  })

  get input(): PleInput {
    return this.configForm.value as PleInput
  }

  @Input()
  set input(value: PleInput) {
    this.configForm.patchValue(value, {
      emitEvent: false,
    })

    this.selectedProvider = value.type
      ? this.providers.find((p) => p.type === value.type)
      : this.providers.find((p) => p.canHandle?.(value))

    this.configEditor?.setOptions({
      ...(value.options || {}),
    })

    this.valueEditor?.setValue(value.value)
  }

  @Output() inputChange = new EventEmitter<PleInput>()

  @Input() mode: 'config' | 'value' | 'design' = 'config'

  get label(): string {
    return this.selectedProvider?.label || ''
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.configForm.valueChanges
        .pipe(
          skip(1),
          debounceTime(500),
          tap((value) => {
            this.selectedProvider = this.providers.find((p) => p.type === value.type)
          })
        )
        .subscribe((value) => this.inputChange.emit(value as PleInput))
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected trackProvider(_: number, provider: PleInputProvider): string {
    return provider.type
  }
}
