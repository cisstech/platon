import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'

const extensions = ['ple']

export class PleEditor extends Editor {
  component = () => import('./ple-editor.module').then((m) => m.PlfEditorModule)
  canHandle(request: OpenRequest): boolean {
    const extension = Paths.extname(request.uri.path)
    if (request.options.preview) return false
    return extensions.includes(extension) && request.uri.query.includes('designer=true')
  }
}
