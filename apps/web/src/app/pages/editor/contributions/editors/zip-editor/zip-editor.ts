import { Editor, OpenRequest, Paths } from '@cisstech/nge-ide/core'

const zipExtensions = ['zip', 'jar', 'war', 'ear', 'rar']

export class ZipEditor extends Editor {
  component = () => import('./zip-editor.module').then((m) => m.ZipEditorModule)
  canHandle(request: OpenRequest): boolean {
    if (request.options.preview) return false
    const extension = Paths.extname(request.uri.path)
    return zipExtensions.includes(extension) && !!request.file?.url
  }
}
