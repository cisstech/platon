import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject } from '@angular/core'
import { ResourceLoaderService } from '@cisstech/nge/services'
import { JsonEditorComponent, JsonEditorOptions, JsonEditorTreeNode } from 'ang-jsoneditor'
import { firstValueFrom } from 'rxjs'
import { BaseValueEditor } from '../../ple-input'

@Component({
  selector: 'app-input-json-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueEditorComponent extends BaseValueEditor<Record<string, unknown>> implements OnInit {
  private readonly resourceLoader = inject(ResourceLoaderService)
  protected readonly editorOptions = new JsonEditorOptions()

  @ViewChild(JsonEditorComponent)
  protected editor!: JsonEditorComponent

  constructor() {
    super()
    this.editorOptions.modes = ['tree', 'view']
    this.editorOptions.mode = this.disabled ? 'view' : 'tree'
    this.editorOptions.language = 'fr-FR'
    this.editorOptions.mainMenuBar = false
    this.editorOptions.sortObjectKeys = false

    this.editorOptions.onEditable = (e) => {
      if (!this.isComponent()) return !this.disabled
      const node = e as JsonEditorTreeNode
      if (node.field === 'cid' || node.field === 'selector') return false
      return true
    }

    this.editorOptions.onBlur = () => {
      const div = this.editor.jsonEditorContainer.nativeElement as HTMLDivElement
      const textNodes = div.querySelectorAll('[class="jsoneditor-value jsoneditor-string"]')
      textNodes.forEach((node) => {
        node.innerHTML = node.textContent?.replace(/\\n/g, '<br/>') || ''
      })
    }
  }

  async ngOnInit(): Promise<void> {
    await firstValueFrom(this.resourceLoader.loadAllAsync([['style', 'assets/vendors/jsoneditor/jsoneditor.min.css']]))
  }

  override setValue(value: Record<string, unknown>): void {
    super.setValue(typeof value === 'object' ? value : {})
  }

  override setDisabled(disabled: boolean): void {
    if (this.editorOptions) {
      this.editorOptions.mode = disabled ? 'view' : 'tree'
    }
    super.setDisabled(disabled)
  }

  private isComponent(): boolean {
    return !!this.value && !!this.value.cid && !!this.value.selector
  }
}
