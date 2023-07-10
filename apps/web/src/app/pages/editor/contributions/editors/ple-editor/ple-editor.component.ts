/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { OutputData } from '@editorjs/editorjs'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { EditorJsVersion } from '@platon/shared/ui'
import { Subscription, debounceTime, firstValueFrom, skip } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import { PleInput } from '../ple-input-editor/ple-input'

const EDITOR_JS_REGEX = /^\s*\{[\s\S]*"blocks"\s*:\s*\[[\s\S]*\][\s\S]*\}\s*$/

const createOutputData = (input: unknown) => {
  if (!input) {
    return {
      time: Date.now(),
      blocks: [],
      version: EditorJsVersion,
    } as OutputData
  }

  const html = input as string
  if (html.match(EDITOR_JS_REGEX)) {
    return JSON.parse(html)
  }

  return {
    time: Date.now(),
    blocks: [
      {
        id: uuidv4(),
        type: 'raw',
        data: {
          html,
        },
      },
    ],
    version: EditorJsVersion,
  } as OutputData
}

@Component({
  selector: 'app-ple-editor',
  templateUrl: './ple-editor.component.html',
  styleUrls: ['./ple-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PleEditorComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder)
  private readonly fileService = inject(FileService)
  private readonly resourceFileService = inject(ResourceFileService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private readonly subscriptions: Subscription[] = []
  private request!: OpenRequest
  private content = ''

  @Input()
  protected editor!: Editor

  protected form = this.fb.group({
    title: [''],
    statement: [createOutputData('')],
    form: [createOutputData('')],
  })

  protected ready = false
  protected readOnly?: boolean

  protected variables: PleInput[] = []
  protected selectedVariable?: PleInput
  protected selectedVariableIndex = -1

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.createEditor()
      })
    )

    this.subscriptions.push(
      this.form.valueChanges
        .pipe(skip(1), debounceTime(300))
        .subscribe(this.onChangeData.bind(this))
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected onChangeData(): void {
    const { value } = this.form

    const replace = (variable: string, data: unknown) => {
      const jsonRegex = `(${variable}+\\s*=\\s*(\\{|\\[)(?:.*\\n)*?(?=\\w+(==|=)))`
      const stringRegex = `(${variable}+\\s*==\\n(?:.*\\n)*?==\\n)|(${variable}\\s*=.+)`

      if (typeof data === 'string') {
        this.content = this.content.replace(
          new RegExp(stringRegex, 'g'),
          `${variable}==\n${data}\n==\n`
        )
      } else if (typeof data === 'object') {
        const output = data as OutputData
        if (output?.version === EditorJsVersion && output.blocks) {
          if (output.blocks.length === 1 && output.blocks[0].type === 'raw') {
            this.content = this.content.replace(
              new RegExp(stringRegex, 'g'),
              `${variable}==\n${output.blocks[0].data.html}\n==\n`
            )
          } else {
            this.content = this.content.replace(
              new RegExp(stringRegex, 'g'),
              `${variable}==\n${JSON.stringify(data, null, 2)}\n==\n`
            )
          }
        } else {
          this.content = this.content.replace(
            new RegExp(jsonRegex, 'g'),
            `${variable} = ${JSON.stringify(data, null, 2)}`
          )
        }
      } else {
        this.content = this.content.replace(new RegExp(stringRegex, 'g'), `${variable} = ${data}`)
      }
    }

    replace('form', value.form)
    replace('title', value.title)
    replace('statement', value.statement)

    this.fileService.update(
      this.request.uri.with({
        query: '',
      }),
      this.content
    )
  }

  protected addVariable() {
    //
  }

  protected selectVariable(index: number) {
    this.selectedVariableIndex = index
    this.selectedVariable = this.variables[index]
    this.changeDetectorRef.markForCheck()
  }

  protected deleteVariable(index: number) {
    console.log(index)
  }
  protected trackVariable(_: number, variable: PleInput): string {
    return variable.name
  }

  private async createEditor(): Promise<void> {
    const file = this.fileService.find(this.request.uri)
    this.readOnly = file?.readOnly

    const [resource, version] = this.request.uri.authority.split(':')
    const [source, content] = await Promise.all([
      firstValueFrom(this.resourceFileService.compile(resource, version)),
      this.fileService.open(
        this.request.uri.with({
          query: '',
        })
      ),
    ])

    this.content = content.current || ''

    this.form.patchValue({
      title: (source.variables.title as string) || '',
      statement: createOutputData(source.variables.statement),
      form: createOutputData(source.variables.form),
    })

    this.variables = Object.keys(source.variables).map((name) => ({
      name,
      type: '',
      description: '',
      value: source.variables[name],
    }))

    this.ready = true
    this.changeDetectorRef.markForCheck()
  }
}
