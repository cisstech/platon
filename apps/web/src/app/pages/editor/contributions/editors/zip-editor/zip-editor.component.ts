/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core'
import { Editor, FileService, OpenRequest } from '@cisstech/nge-ide/core'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-zip-editor',
  templateUrl: './zip-editor.component.html',
  styleUrls: ['./zip-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZipEditorComponent implements OnInit, OnDestroy {
  private readonly fileService = inject(FileService)
  private readonly subscriptions: Subscription[] = []
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  @Input()
  protected editor!: Editor
  protected request!: OpenRequest

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.editor.onChangeRequest.subscribe((request) => {
        this.request = request
        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}
