/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { OutputData } from '@editorjs/editorjs'
import { Variables, flattenAssignmentNodes } from '@platon/feature/compiler'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { EditorJsVersion } from '@platon/shared/ui'
import { Subscription, debounceTime, firstValueFrom, skip } from 'rxjs'
import { v4 as uuidv4 } from 'uuid'
import { InputCodeOptions } from '../ple-input-editor/input-code/input-code'
import { PleInput } from '../ple-input-editor/ple-input'

const EDITOR_JS_REGEX = /^\s*\{[\s\S]*"blocks"\s*:\s*\[[\s\S]*\][\s\S]*\}\s*$/
const HIDDEN_VARIABLES = ['author', 'title', 'statement', 'form']

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

const parseOutputData = (data: unknown) => {
  if (typeof data === 'string') {
    return data
  }

  const output = data as OutputData
  if (output?.version === EditorJsVersion && output.blocks) {
    if (output.blocks.length === 1 && output.blocks[0].type === 'raw') {
      return output.blocks[0].data.html
    }
    return JSON.stringify(data, null, 2)
  }

  return JSON.stringify(data, null, 2)
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
      this.form.valueChanges.pipe(skip(1), debounceTime(300)).subscribe(this.onChangeData.bind(this))
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async onChangeData(): Promise<void> {
    const [resource, version] = this.request.uri.authority.split(':')
    const { value } = this.form

    const content = await firstValueFrom(
      this.resourceFileService.transformExercise(
        resource,
        {
          changes: {
            ...this.variables.reduce((acc, curr) => {
              acc[curr.name] = curr.value
              return acc
            }, {} as Variables),
            title: parseOutputData(value.title || ''),
            statement: parseOutputData(value.statement || ''),
            form: parseOutputData(value.form || ''),
          },
        },
        version
      )
    )

    this.fileService.update(this.request.uri, content)
  }

  protected addVariable(): void {
    this.variables = [
      ...this.variables,
      {
        name: `var${this.variables.length - 1}`,
        type: 'text',
        value: '',
      } as PleInput,
    ]
  }

  protected selectVariable(index: number): void {
    this.selectedVariableIndex = index
    this.selectedVariable = this.variables[index]
    this.changeDetectorRef.markForCheck()
  }

  protected deleteVariable(index: number): void {
    this.variables.splice(index, 1)
    this.selectedVariable = undefined
    this.selectedVariableIndex = -1
    this.onChangeData()
  }

  protected updateVariable(variable: PleInput): void {
    this.variables = this.variables.map((v, i) => (i === this.selectedVariableIndex ? variable : v))
    this.onChangeData()
  }

  protected trackVariable(_: number, variable: PleInput): string {
    return variable.name
  }

  private async createEditor(): Promise<void> {
    const file = this.fileService.find(this.request.uri)
    this.readOnly = file?.readOnly

    const [resource, version] = this.request.uri.authority.split(':')
    const [source] = await Promise.all([
      firstValueFrom(this.resourceFileService.compileExercise(resource, version)),
      this.fileService.open(this.request.uri),
    ])

    const { variables } = source.ast
    this.form.patchValue({
      title: (variables.title as string) || '',
      statement: createOutputData(variables.statement),
      form: createOutputData(variables.form),
    })

    if (this.readOnly) {
      this.form.disable({ emitEvent: false })
    }

    const sandbox = source.variables.sandbox || 'javascript'
    this.variables = Object.keys(variables)
      .filter((variable) => !HIDDEN_VARIABLES.includes(variable))
      .map((name) => ({
        name,
        type: '',
        description: '',
        value: variables[name],
        options: {
          ...(name === 'grader' ? ({ language: sandbox } as InputCodeOptions) : {}),
          ...(name === 'builder' ? ({ language: sandbox } as InputCodeOptions) : {}),
        },
      }))

    this.ready = true
    this.changeDetectorRef.markForCheck()
  }
}
