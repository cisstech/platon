import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core'
import EditorJS, { OutputData } from '@editorjs/editorjs'
import { EditorJsService } from './editorjs.service'
import { CodeExtension } from './extensions/code.extension'
import { DelimiterExtension } from './extensions/delimiter.extension'
import { ImageExtension } from './extensions/image.extension'
import { ListExtension } from './extensions/list.extension'
import { RawExtension } from './extensions/raw.extension'
import { TableExtension } from './extensions/table.extension'
import { TextExtension } from './extensions/text.extension'
import { v4 as uuidv4 } from 'uuid'

export const EditorJsVersion = EditorJS.version

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
  ],
})
export class EditorJsComponent implements OnInit, OnDestroy {
  private editor!: EditorJS

  protected readonly id = `editorjs-${uuidv4()}`

  @Input() data?: OutputData
  @Input() minHeight?: number
  @Input() readOnly?: boolean
  @Output() dataChange = new EventEmitter<OutputData>()

  constructor(private readonly editorJsService: EditorJsService) {}

  async ngOnInit(): Promise<void> {
    let initalChange = true
    this.editor = this.editorJsService.newInstance({
      data: this.data,
      holder: this.id,
      minHeight: this.minHeight,
      readOnly: this.readOnly,
      onChange: async () => {
        if (initalChange) {
          initalChange = false
          return
        }
        this.dataChange.emit(await this.editor?.save())
      },
    })
  }

  ngOnDestroy(): void {
    this.editor?.destroy?.()
  }
}
