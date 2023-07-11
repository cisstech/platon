import { ComponentType } from '@angular/cdk/portal'
import { ChangeDetectorRef, InjectionToken, inject } from '@angular/core'

export interface PleInput<TValue = unknown, TOptions = unknown> {
  name: string
  type: string
  description: string
  value?: TValue
  options?: TOptions
}

export interface PleInputValueEditor<TValue = unknown, TOptions = unknown> {
  setOptions?(options: TOptions): void
  setValue(value: TValue): void
  onChangeValue(consumer: (value: TValue) => void): void
}

export interface PleInputConfigEditor<TOptions = unknown> {
  setOptions(options: TOptions): void
  onChangeOptions(consumer: (options: TOptions) => void): void
}

export interface PleInputProvider {
  type: string
  label: string
  canHandle?(input: PleInput): boolean
  valueEditor: ComponentType<PleInputValueEditor>
  configEditor?: ComponentType<PleInputConfigEditor>
}

export type OnInitValueEditor = (instance: PleInputValueEditor) => void
export type OnInitConfigEditor = (instance: PleInputConfigEditor) => void

export const PLE_INPUT_PROVIDERS = new InjectionToken<PleInputProvider[]>('PLE_INPUT_PROVIDERS')
export const VALUE_EDITOR_TOKEN = new InjectionToken<OnInitValueEditor>('VALUE_EDITOR_TOKEN')
export const CONFIG_EDITOR_TOKEN = new InjectionToken<OnInitConfigEditor>('CONFIG_EDITOR_TOKEN')

export abstract class BaseValueEditor<TValue = unknown, TOptions = unknown>
  implements PleInputValueEditor<TValue, TOptions>
{
  protected readonly onInit = inject(VALUE_EDITOR_TOKEN)
  protected readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected value?: TValue
  protected options?: TOptions
  protected notifyValueChange?: (value: TValue) => void

  constructor() {
    this.onInit(this)
  }

  setOptions(options: TOptions): void {
    this.options = options
    this.changeDetectorRef.markForCheck()
  }

  setValue(value: TValue): void {
    this.value = value
    this.changeDetectorRef.markForCheck()
  }

  onChangeValue(consumer: (value: TValue) => void): void {
    this.notifyValueChange = (value) => consumer(value)
  }
}

export abstract class BaseConfigEditor<TOptions = unknown> implements PleInputConfigEditor<TOptions> {
  protected readonly onInit = inject(CONFIG_EDITOR_TOKEN)
  protected readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected options: TOptions = {} as TOptions
  protected notifyOptionsChange?: (options: TOptions) => void

  constructor() {
    this.onInit(this)
  }

  setOptions(options: TOptions): void {
    this.options = (options || {}) as TOptions
    this.changeDetectorRef.markForCheck()
  }

  onChangeOptions(consumer: (value: TOptions) => void): void {
    this.notifyOptionsChange = consumer
  }
}
