import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'

const extensions = ['pla']

export class PlaEditor extends Editor {
  component = () => import('./pla-editor.module').then((m) => m.PlfEditorModule)
  canHandle(request: OpenRequest): boolean {
    if (request.options.preview) return false
    const extension = Paths.extname(request.uri.path)
    return extensions.includes(extension)
  }
}
