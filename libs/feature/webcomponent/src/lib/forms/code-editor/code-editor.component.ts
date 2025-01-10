// tslint:disable: no-bitwise

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core'
import { ACTION_GOTO_LINE, ACTION_INDENT_USING_SPACES, ACTION_QUICK_COMMAND } from '@cisstech/nge/monaco'
import { NO_COPY_PASTER_CLASS_NAME } from '@platon/feature/player/common'
import { WebComponent, WebComponentHooks } from '../../web-component'
import { WebComponentChangeDetectorService } from '../../web-component-change-detector.service'
import { CodeEditorComponentDefinition, CodeEditorState } from './code-editor'

@Component({
  selector: 'wc-code-editor',
  templateUrl: 'code-editor.component.html',
  styleUrls: ['code-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@WebComponent(CodeEditorComponentDefinition)
export class CodeEditorComponent implements AfterViewChecked, OnDestroy, WebComponentHooks<CodeEditorState> {
  private readonly disposables: monaco.IDisposable[] = []
  private model?: monaco.editor.ITextModel
  private editor?: monaco.editor.IStandaloneCodeEditor
  private width = 0
  private height = 0

  @Input() state!: CodeEditorState
  @Output() stateChange = new EventEmitter<CodeEditorState>()

  @ViewChild('footer', { static: true })
  footer!: ElementRef<HTMLElement>

  initialCode = ''
  cursor: monaco.IPosition = {
    column: 0,
    lineNumber: 0,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decorations: any[] = []

  constructor(readonly injector: Injector, readonly changeDetector: WebComponentChangeDetectorService) {}

  ngAfterViewChecked() {
    if (!this.editor || !this.footer) return

    const rect = this.footer.nativeElement.getBoundingClientRect()
    if (!rect) return

    const { width, height } = rect
    if (this.width !== width || this.height !== height) {
      this.editor?.layout()
      this.width = width
      this.height = height
    }
  }

  ngOnDestroy() {
    this.disposables.forEach((d) => d.dispose())
  }

  onCreateEditor(editor: monaco.editor.IEditor) {
    this.editor = editor as monaco.editor.IStandaloneCodeEditor

    editor.setModel(
      (this.model = this.model || monaco.editor.createModel(this.state.code || '', this.state.language || 'plaintext'))
    )

    // OPTIONS
    this.detectOptionsChange()
    this.model.updateOptions({
      tabSize: this.state.tabSize,
      insertSpaces: true,
      trimAutoWhitespace: true,
    })

    this.editor.updateOptions({
      autoIndent: 'advanced',
      lineNumbers: 'on',
      renderWhitespace: 'all',
      quickSuggestions: true,
      glyphMargin: false,
      renderControlCharacters: true,
      contextmenu: document.querySelector(`.${NO_COPY_PASTER_CLASS_NAME}`) == null,
      minimap: {
        enabled: true,
      },
      scrollbar: {
        verticalScrollbarSize: 4,
        verticalSliderSize: 4,
      },
    })

    // LISTENERS
    this.disposables.push(this.model)
    this.disposables.push(this.editor)
    this.disposables.push(
      this.model.onDidChangeContent(() => {
        this.changeDetector
          .ignore(this, () => {
            this.state.code = this.model?.getValue() || ''
            this.state.isFilled = this.state.code !== this.initialCode
          })
          .catch(console.error)
      })
    )
    this.disposables.push(
      this.editor.onDidChangeCursorPosition((e) => {
        this.changeDetector
          .ignore(this, () => {
            this.cursor = e.position
          })
          .catch(console.error)
      })
    )

    /*    this.disposables.push(
      this.editor.onDidChangeCursorSelection(() => {
        console.log('onDidChangeCursorSelection')
        const { column, lineNumber } = this.editor!.getPosition()!
        this.editor!.setPosition({ lineNumber, column })
      })
    ) */
    // COMMANDS
    this.editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      () => {
        //
      },
      ''
    )
    /*
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      console.log('Ctrl+C')
      return null
    })

    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      console.log('Ctrl+V')
      return null
    }) */

    this.initialCode = this.state.code
  }

  onChangeState() {
    if (!this.model) return

    monaco.editor.setModelLanguage(this.model, this.state.language || 'plaintext')

    this.editor?.updateOptions({
      tabSize: this.state.tabSize,
      quickSuggestions: this.state.quickSuggestions,
    })
    this.model.setValue(this.state.code)
  }

  reset() {
    this.state.code = this.initialCode
    this.onChangeState()
  }

  goToLine() {
    if (!this.editor) return
    const action = this.editor.getAction(ACTION_GOTO_LINE)
    this.editor.focus()
    action?.run().catch(console.error)
  }

  quickCommand() {
    if (!this.editor) return
    const action = this.editor.getAction(ACTION_QUICK_COMMAND)
    this.editor.focus()
    action?.run().catch(console.error)
  }

  changeIndent() {
    if (!this.editor) return
    const action = this.editor.getAction(ACTION_INDENT_USING_SPACES)
    this.editor.focus()
    action?.run().catch(console.error)
  }

  private detectOptionsChange() {
    if (!this.model) return

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const updateOptions = this.model.updateOptions
    this.model.updateOptions = function (
      this: monaco.editor.ITextModel,
      options: monaco.editor.ITextModelUpdateOptions
    ) {
      updateOptions.apply(this, [options])
      if (options.tabSize) {
        that.changeDetector
          .ignore(that, () => {
            that.state.tabSize = options.tabSize || that.state.tabSize
          })
          .catch(console.error)
      }
    }
  }
}
