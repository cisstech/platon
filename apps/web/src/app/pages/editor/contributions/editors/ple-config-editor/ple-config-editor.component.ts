import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { Subscription } from 'rxjs'
import { PleInput } from '../ple-input-editor/ple-input'
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-ple-config-editor',
  templateUrl: './ple-config-editor.component.html',
  styleUrls: ['./ple-config-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PleConfigEditorComponent implements OnInit, OnDestroy {
  private readonly fileService = inject(FileService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private readonly subscriptions: Subscription[] = []
  private request!: OpenRequest

  protected readOnly?: boolean

  @Input()
  protected editor!: Editor

  protected inputs: PleInput[] = []
  protected selection: PleInput | undefined
  protected selectionIndex = 0

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.createEditor()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected addInput(): void {
    this.inputs = [
      ...this.inputs,
      {
        name: `variable${this.inputs.length + 1}`,
        description: '',
        type: '',
      },
    ]
    this.selectInput(this.inputs.length - 1)
    this.onChangeInput()
  }

  protected deleteInput(index: number): void {
    this.inputs = this.inputs.filter((_, i) => i !== index)
    this.selection = undefined
    this.selectionIndex = -1
    this.onChangeInput()
  }

  protected selectInput(index: number): void {
    this.selection = this.inputs[index]
    this.selectionIndex = index
  }

  protected onReorder(event: CdkDragDrop<PleInput[]>) {
    if (this.readOnly) return
    moveItemInArray(this.inputs, event.previousIndex, event.currentIndex)
    this.selectInput(event.currentIndex)
    this.onChangeInput()
  }

  protected onChangeInput(value?: PleInput): void {
    if (value) {
      this.selection = value
      this.inputs[this.selectionIndex] = value
    }

    const content = {
      inputs: this.inputs,
    }

    this.fileService.update(this.request.uri, JSON.stringify(content, null, 2))
    this.changeDetectorRef.detectChanges()
  }

  protected trackByIndex(index: number) {
    return index
  }

  private async createEditor(): Promise<void> {
    const file = this.fileService.find(this.request.uri)
    this.readOnly = file?.readOnly

    const content = await this.fileService.open(this.request.uri)
    try {
      const data = JSON.parse(content.current ?? '{ "input": [] }')
      this.inputs = data.inputs
    } catch {
      this.inputs = []
    }
    this.changeDetectorRef.detectChanges()
  }
}
