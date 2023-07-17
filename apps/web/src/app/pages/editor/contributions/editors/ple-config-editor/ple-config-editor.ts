import { Editor, OpenRequest } from '@cisstech/nge-ide/core'
import { ResourceTypes } from '@platon/feature/resource/common'
import { EditorPresenter } from '../../../editor.presenter'

export const PLE_CONFIG_FILE_PATH = '/config.json'

export class PleConfigEditor extends Editor {
  component = () => import('./ple-config-editor.module').then((m) => m.PleConfigEditorModule)
  canHandle(request: OpenRequest): boolean {
    const presenter = request.injector.get(EditorPresenter)
    return request.uri.path === PLE_CONFIG_FILE_PATH && presenter.currentResource.type === ResourceTypes.EXERCISE
  }
}
