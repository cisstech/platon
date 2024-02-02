import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Editor, FileService, NotificationService, OpenRequest } from '@cisstech/nge-ide/core'
import { EXERCISE_CONFIG_FILE, EXERCISE_MAIN_FILE, PleInput, Variables } from '@platon/feature/compiler'
import { Subscription } from 'rxjs'
import { EditorPresenter } from '../../../editor.presenter'

@Component({
  selector: 'app-plo-editor',
  templateUrl: './plo-editor.component.html',
  styleUrls: ['./plo-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PloEditorComponent implements OnInit, OnDestroy {
  private readonly fileService = inject(FileService)
  private readonly presenter = inject(EditorPresenter)
  private readonly notificationService = inject(NotificationService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private readonly subscriptions: Subscription[] = []
  private request!: OpenRequest

  protected readOnly?: boolean
  protected debug = false

  @Input()
  protected editor!: Editor

  protected inputs: PleInput[] = []
  protected overrides: Variables = {}
  protected selection: PleInput | undefined
  protected selectionIndex = -1

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.createEditor().catch(console.error)
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected selectInput(index: number): void {
    this.selection = this.inputs[index]
    this.selectionIndex = index
  }

  protected onChangeInput(value?: PleInput): void {
    if (value) {
      this.selection = value
      this.inputs[this.selectionIndex] = value
      this.overrides[value.name] = value.value
    }

    this.fileService.update(this.request.uri, JSON.stringify(this.overrides, null, 2))
    this.changeDetectorRef.detectChanges()
  }

  private async createEditor(): Promise<void> {
    const file = this.request.file!
    this.readOnly = file?.readOnly

    const { currentResource, currentVersion } = this.presenter
    const main = await this.fileService.readFile(
      this.presenter.buildUri(currentResource!.id, currentVersion, EXERCISE_MAIN_FILE)
    )

    const tokens = main
      .replace('@extends', '')
      .trim()
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean)

    const [template, version] = tokens[0].split(':')
    try {
      const [content, configContent] = await Promise.all([
        this.fileService.open(this.request.uri),
        this.fileService.readFile(this.presenter.buildUri(template, version, EXERCISE_CONFIG_FILE)),
      ])
      this.overrides = JSON.parse(content.current ?? '{}')

      if (!configContent) {
        this.notificationService.publishError(`No config file found in the template ${template}:${version}`)
        return
      }

      const config = JSON.parse(configContent)
      this.inputs = config.inputs
      this.inputs.forEach((input) => {
        input.value = this.overrides[input.name] ?? input.value
      })
    } catch {
      this.notificationService.publishError(`Unable to open and parse the PLO ${file.uri.path}`)
    }
    this.changeDetectorRef.detectChanges()
  }
}
