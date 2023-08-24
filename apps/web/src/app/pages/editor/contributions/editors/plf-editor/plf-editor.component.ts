/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { OutputData } from '@editorjs/editorjs'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-plf-editor',
  templateUrl: './plf-editor.component.html',
  styleUrls: ['./plf-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlfEditorComponent implements OnInit, OnDestroy {
  private readonly fileService = inject(FileService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly subscriptions: Subscription[] = []

  private request!: OpenRequest

  protected data?: OutputData
  protected disabled = false

  @Input()
  protected editor!: Editor

  ngOnInit(): void {
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

  protected onChangeData(data: OutputData): void {
    this.fileService.update(this.request.uri, JSON.stringify(data, null, 2))
  }

  private async createEditor(): Promise<void> {
    const file = this.fileService.find(this.request.uri)
    this.disabled = !!file?.readOnly

    const content = await this.fileService.open(this.request.uri)
    try {
      this.data = JSON.parse(content.current || '{}')
    } catch {
      this.data = {
        blocks: [],
      }
    } finally {
      this.changeDetectorRef.detectChanges()
    }
  }
}
