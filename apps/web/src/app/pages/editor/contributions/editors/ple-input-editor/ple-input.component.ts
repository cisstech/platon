import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  forwardRef,
  inject,
} from '@angular/core'
import { ControlValueAccessor, FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms'
import { PleInput } from '@platon/feature/compiler'
import { Subscription, debounceTime } from 'rxjs'
import { InputBooleanProvider } from './input-boolean'
import { InputCodeProvider } from './input-code'
import { InputFileProvider } from './input-file'
import { InputJsonProvider } from './input-json'
import { InputNumberProvider } from './input-number'
import { InputTextProvider } from './input-text'
import {
  CONFIG_EDITOR_TOKEN,
  PLE_INPUT_PROVIDERS,
  PleInputConfigEditor,
  PleInputProvider,
  PleInputValueEditor,
  VALUE_EDITOR_TOKEN,
} from './ple-input'

@Component({
  selector: 'app-ple-input',
  templateUrl: 'ple-input.component.html',
  styleUrls: ['ple-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

  providers: [
    // THE ORDER IS IMPORTANT SINCE THE `canHandle` METHOD IS CALLED IN THE SAME ORDER
    InputNumberProvider,
    InputBooleanProvider,
    InputJsonProvider,
    InputFileProvider,
    InputCodeProvider, // string is always handled by code editor
    InputTextProvider,

    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PleInputComponent),
      multi: true,
    },
  ],
})
export class PleInputComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private readonly fb = inject(FormBuilder)
  private readonly injector = inject(Injector)
  private readonly subscriptions: Subscription[] = []
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private valueEditor?: PleInputValueEditor
  private configEditor?: PleInputConfigEditor

  protected hasNameError?: boolean
  protected selectedProvider?: PleInputProvider

  protected readonly form = this.fb.group({
    name: [''],
    type: [''],
    description: [''],
    value: [{} as unknown],
    options: [{} as unknown],
  })

  protected readonly providers: ReadonlyArray<Readonly<PleInputProvider>> =
    inject(PLE_INPUT_PROVIDERS, {
      optional: true,
    }) || []

  protected readonly sortedProviders = [...this.providers].sort((a, b) => a.label.localeCompare(b.label))

  protected readonly configEditorInjector = Injector.create({
    providers: [
      {
        provide: CONFIG_EDITOR_TOKEN,
        useValue: (instance: PleInputConfigEditor) => {
          this.configEditor = instance
          instance.setOptions(this.input.options || {})
          instance.setDisabled(!!this.disabled)
          instance.onChangeOptions((options) => {
            this.valueEditor?.setOptions?.(options)
            this.form.patchValue({ options })
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
          instance.setDisabled(!!this.disabled)
          instance.setOptions?.(this.input.options || {})
          instance.onChangeValue((value) => {
            this.form.patchValue({ value })
          })
        },
      },
    ],
    parent: this.injector,
  })

  get input(): PleInput {
    return this.form.value as PleInput
  }

  @Input()
  set input(value: PleInput) {
    this.selectedProvider = value.type
      ? this.providers.find((p) => p.type === value.type)
      : this.providers.find((p) => p.canHandle?.(value))

    if (this.selectedProvider) {
      value.type = this.selectedProvider.type
    }

    this.form.patchValue(value, { emitEvent: false })
  }

  @Output() inputChange = new EventEmitter<PleInput>()

  @Input() mode: 'config' | 'value' | 'design' = 'config'
  @Input() disabled? = false
  @Input() reservedNames: string[] = []

  get label(): string {
    return this.selectedProvider?.label || ''
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.form.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
        const oldSelectedProvider = this.selectedProvider
        this.selectedProvider = this.providers.find((p) => p.type === value.type)
        if (oldSelectedProvider && oldSelectedProvider.type !== this.selectedProvider?.type) {
          this.form.patchValue({
            value: this.selectedProvider?.defaultValue(),
            options: this.selectedProvider?.defaultOptions?.() || {},
          })
          this.changeDetectorRef.markForCheck()
          return
        }

        this.hasNameError = false
        if (value.name && this.reservedNames?.includes(value.name.trim())) {
          this.hasNameError = true
          this.form.updateValueAndValidity({ emitEvent: false })
          this.changeDetectorRef.markForCheck()
          return
        }

        this.inputChange.emit(value as PleInput)
        this.onChange(value as PleInput)
      })
    )

    if (this.disabled) {
      this.form.disable({ emitEvent: false })
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  // ControlValueAccessor methods

  onChange: (value: unknown) => void = () => {
    //
  }

  onTouched: () => void = () => {
    //
  }

  writeValue(value: PleInput): void {
    this.input = value
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

  protected trackProvider(_: number, provider: PleInputProvider): string {
    return provider.type
  }
}
