import { HttpClient } from '@angular/common/http'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import { NgeMonacoModule } from '@cisstech/nge/monaco'
import { DialogModule, DialogService } from '@platon/core/browser'
import { ResourceService } from '@platon/feature/resource/browser'
import { Resource } from '@platon/feature/resource/common'
import { UiError404Component, UiModalIFrameComponent } from '@platon/shared/ui'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSkeletonComponent } from 'ng-zorro-antd/skeleton'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  imports: [
    NzIconModule,
    NzButtonModule,
    NzSkeletonComponent,

    NgeMonacoModule,

    DialogModule,
    UiError404Component,
    UiModalIFrameComponent,
  ],
  selector: 'app-exercise-playground',
  templateUrl: 'exercise-playground.page.html',
  styleUrl: 'exercise-playground.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisePlaygroundPage implements OnInit, OnDestroy {
  private readonly disposables: monaco.IDisposable[] = []
  private readonly http = inject(HttpClient)
  private readonly dialogService = inject(DialogService)
  private readonly resourceService = inject(ResourceService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  private resource?: Resource

  @Input()
  protected readonly component!: string

  @Input()
  protected readonly file!: string

  @ViewChild(UiModalIFrameComponent)
  protected readonly iframe!: UiModalIFrameComponent

  protected content = ''
  protected loading = true
  protected previewing = false

  ngOnInit(): void {
    if (!this.component || !this.file) {
      return
    }

    this.http.get(`/assets/playground/exercises/${this.component}/${this.file}`, { responseType: 'text' }).subscribe({
      next: (content) => {
        this.content = content
        this.loading = false
      },
      error: (error) => {
        console.error(error)
        this.loading = false
      },
      complete: () => {
        this.changeDetectorRef.detectChanges()
      },
    })
  }

  ngOnDestroy(): void {
    this.disposables.forEach((d) => d.dispose())
  }

  onCreateEditor(editor: monaco.editor.IStandaloneCodeEditor) {
    editor.setModel(monaco.editor.createModel(this.content, 'pl-js'))
    this.disposables.push(
      editor.onDidChangeModelContent(() => {
        this.content = editor.getValue()
      })
    )
  }

  protected async preview(): Promise<void> {
    try {
      this.previewing = true
      this.resource = await firstValueFrom(
        this.resourceService.createPreview({
          files: [
            {
              path: 'main.ple',
              content: this.content,
            },
          ],
          resourceId: this.resource?.id,
        })
      )
      this.iframe.open(`/player/preview/${this.resource.id}?version=latest`)
    } catch (error) {
      console.error(error)
      this.dialogService.error("Une erreur est survenue lors de la prévisualisation de l'exercice")
    } finally {
      this.previewing = false
      this.changeDetectorRef.detectChanges()
    }
  }
}
