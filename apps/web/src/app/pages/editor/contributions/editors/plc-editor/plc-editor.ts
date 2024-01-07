import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'
import { EXERCISE_CONFIG_FILE } from '@platon/feature/compiler'

export const PLE_CONFIG_FILE_PATH = `/${EXERCISE_CONFIG_FILE}`

export class PleConfigEditor extends Editor {
  component = () => import('./plc-editor.module').then((m) => m.PleConfigEditorModule)
  canHandle(request: OpenRequest): boolean {
    const extension = Paths.extname(request.uri.path)
    return extension === 'plc'
  }
}
