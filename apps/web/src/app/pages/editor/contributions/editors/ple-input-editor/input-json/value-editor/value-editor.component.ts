import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { ResourceLoaderService } from '@cisstech/nge/services'
import { JsonEditorOptions } from 'ang-jsoneditor'
import { firstValueFrom } from 'rxjs'
import { BaseValueEditor } from '../../ple-input'

@Component({
  selector: 'app-input-json-value-editor',
  templateUrl: 'value-editor.component.html',
  styleUrls: ['value-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputJsonValueEditorComponent extends BaseValueEditor<Record<string, unknown>> implements OnInit {
  private readonly resourceLoader = inject(ResourceLoaderService)
  protected readonly editorOptions = new JsonEditorOptions()

  constructor() {
    super()
    this.editorOptions.modes = ['tree', 'view', 'form', 'code', 'text']
    this.editorOptions.mode = 'tree'
    this.editorOptions.language = 'fr-FR'
    this.editorOptions.mainMenuBar = true
    this.editorOptions.sortObjectKeys = true
  }

  async ngOnInit(): Promise<void> {
    await firstValueFrom(this.resourceLoader.loadAllAsync([['style', 'assets/vendors/jsoneditor/jsoneditor.min.css']]))
  }
}
