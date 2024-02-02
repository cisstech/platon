import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, forwardRef } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { v4 as uuidv4 } from 'uuid'
import { EditorJsService } from './editorjs.service'
import { CodeExtension } from './extensions/code.extension'
import { DelimiterExtension } from './extensions/delimiter.extension'
import { ImageExtension } from './extensions/image.extension'
import { ListExtension } from './extensions/list.extension'
import { RawExtension } from './extensions/raw.extension'
import { TableExtension } from './extensions/table.extension'
import { TextExtension } from './extensions/text.extension'

@Component({
  selector: 'ui-editorjs',
  templateUrl: './editorjs.component.html',
  styleUrls: ['./editorjs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    EditorJsService,
    CodeExtension,
    DelimiterExtension,
    ListExtension,
    RawExtension,
    TableExtension,
    TextExtension,
    ImageExtension,

    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorJsComponent),
      multi: true,
    },
  ],
})
export class EditorJsComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  private data?: OutputData
  private editor!: EditorJS

  protected readonly id = `editorjs-${uuidv4()}`

  @Input() minHeight?: number
  @Input() disabled?: boolean | null

  constructor(private readonly editorJsService: EditorJsService) {}

  async ngAfterViewInit(): Promise<void> {
    let initialChange = true
    const editor = (this.editor = this.editorJsService.newInstance({
      data: this.data,
      holder: this.id,
      minHeight: this.minHeight,
      readOnly: !!this.disabled,
      onChange: async () => {
        if (initialChange) {
          initialChange = false
          return
        }

        this.notifyChange(await editor.save())
      },
    }))
  }

  ngOnDestroy(): void {
    this.editor?.destroy?.()
  }

  // ControlValueAccessor methods

  onChange: (value: unknown) => void = () => {
    //
  }

  onTouched: () => void = () => {
    //
  }

  async writeValue(value: OutputData): Promise<void> {
    if (value?.blocks && !value.blocks.length) {
      value.blocks.push({
        type: 'paragraph',
        data: {
          text: '',
        },
      })
    }

    this.data = value
    if (this.editor && this.data) {
      await this.editor.isReady
      await this.editor.render(this.data)
    }
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

  private notifyChange(newData: OutputData): void {
    this.data = newData
    this.onChange(this.data)
  }
}
