import { ChangeDetectionStrategy, Component, Pipe, PipeTransform, inject } from '@angular/core'
import { DndData, EditorService, NotificationService } from '@cisstech/nge-ide/core'
import { EditorPresenter } from '../../../../../editor.presenter'
import { ResourceFileSystemProvider } from '../../../../file-system'
import { BaseValueEditor } from '../../ple-input'

@Pipe({ name: 'hideResourceId' })
export class HideResourceIdPipe implements PipeTransform {
  transform(value?: string | null): string | null | undefined {
    if (!value) {
      return value
    }
    return value.replace(/\/[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}:[^/]+\//, '')
  }
}

@Component({
  selector: 'app-input-file-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<string> {
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
    super.setValue(typeof value === 'string' && value.match(/^@copycontent\s|@copyurl\s/) ? value : '')
  }

  protected onDrop(data: DndData) {
    if (this.disabled) {
      return
    }

    const { activeResource } = this.editorService
    if (!activeResource || !data.src) {
      return
    }

    const uri = monaco.Uri.parse(data.src)

    let path = ''
    try {
      path = this.editorPresenter.resolvePath(uri, activeResource, true)
      if (path) {
        this.changeValue((this.value = `@copycontent ${path}`))
      }
    } catch (error) {
      this.notificationService.publishError(error)
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
    const reference = (this.value?.replace(/@copycontent|@copyurl/g, '') || '').trim()
    if (!reference.startsWith('/')) {
      const [resource, version] = (this.editorService.activeResource as monaco.Uri).authority.split(':')
      const uri = this.fileSystemProvider.buildUri(resource, version, reference)
      this.editorService.open(uri).catch(console.error)
      return
    }

    // first element is empty string since the string starts with a slash
    const [, authority, path] = reference.split('/')
    const [resource, version] = authority.split(':')
    const uri = this.fileSystemProvider.buildUri(resource, version, path)
    this.editorService.open(uri).catch(console.error)
  }
}
