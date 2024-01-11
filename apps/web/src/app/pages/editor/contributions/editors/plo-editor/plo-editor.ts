import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'
import { EXERCISE_CONFIG_FILE } from '@platon/feature/compiler'

export const PLE_CONFIG_FILE_PATH = `/${EXERCISE_CONFIG_FILE}`

export class PloEditor extends Editor {
  component = () => import('./plo-editor.module').then((m) => m.PleConfigEditorModule)
  canHandle(request: OpenRequest): boolean {
    const extension = Paths.extname(request.uri.path)
    return extension === 'plo'
  }
}
