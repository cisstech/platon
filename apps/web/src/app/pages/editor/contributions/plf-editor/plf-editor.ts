import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'

const extensions = ['plf']

export class PlfEditor extends Editor {
  component = () => import('./plf-editor.module').then((m) => m.PlfEditorModule)
  canHandle(request: OpenRequest): boolean {
    const extension = Paths.extname(request.uri.path)
    return extensions.includes(extension)
  }
}
