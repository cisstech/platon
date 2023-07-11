import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { DndData, EditorService, NotificationService } from '@cisstech/nge-ide/core'
import { EditorPresenter } from '../../../../../editor.presenter'
import { BaseValueEditor } from '../../ple-input'
import { ResourceFileSystemProvider } from '../../../../file-system'

@Component({
  selector: 'app-input-file-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFileValueEditorComponent extends BaseValueEditor<string> {
  private readonly editorService = inject(EditorService)
  private readonly editorPresenter = inject(EditorPresenter)
  private readonly fileSystemProvider = inject(ResourceFileSystemProvider)
  private readonly notificationService = inject(NotificationService)

  protected get isUrl(): boolean {
    return !!this.value?.startsWith('@copyurl')
  }

  protected get isContent(): boolean {
    return !!this.value?.startsWith('@copycontent')
  }

  constructor() {
    super()
  }

  override setValue(value: string): void {
    super.setValue(typeof value === 'string' ? value : '')
  }

  protected onDrop(data: DndData) {
    if (data.src) {
      const uri = monaco.Uri.parse(data.src)

      const { currentAncestors, currentResource } = this.editorPresenter
      const [resource, version] = uri.authority.split(':')

      const code =
        currentResource.id === resource
          ? `/relative`
          : currentAncestors.find((ancestor) => ancestor.code === resource)?.code

      if (!code) {
        this.notificationService.publishError('Impossible de copier le fichier')
        return
      }

      this.changeValue((this.value = `@copycontent ${code}:${version}${uri.path}`))
    }
  }

  protected changeValue(value: string) {
    this.notifyValueChange?.((this.value = value))
  }

  protected switchToUrl() {
    this.changeValue(this.value?.replace('@copycontent', '@copyurl') || '')
  }

  protected switchToContent() {
    this.changeValue(this.value?.replace('@copyurl', '@copycontent') || '')
  }

  protected openFile() {
    const reference = this.value?.replace(/@copycontent|@copyurl/g, '') || ''
    const [location, path] = reference.trim().split('/')
    const [resource, version] = location.split(':')
    const uri = this.fileSystemProvider.buildUri(resource, version, path)
    this.editorService.open(uri)
  }
}
