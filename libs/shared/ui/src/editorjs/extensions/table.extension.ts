import Table from '@editorjs/table'
import { EditorJsExtension, EDITOR_JS_EXTENSION } from '../editorjs'

const Extension: EditorJsExtension = {
  tools: {
    table: {
      class: Table,
      inlineToolbar: true,
    },
  },
}

export const TableExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension,
}
