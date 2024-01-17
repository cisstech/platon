import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'

export class PdfEditor extends Editor {
  component = () => import('./pdf-editor.module').then((m) => m.PdfEditorModule)
  canHandle(request: OpenRequest): boolean {
    if (request.options.preview) return false
    const extension = Paths.extname(request.uri.path)
    return extension === 'pdf' && !!request.file?.url
  }
}
