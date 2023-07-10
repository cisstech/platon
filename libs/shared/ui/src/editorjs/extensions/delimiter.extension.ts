import Delimiter from '@editorjs/delimiter'
import { EditorJsExtension, EDITOR_JS_EXTENSION } from '../editorjs'

const Extension: EditorJsExtension = {
  tools: {
    delimiter: {
      class: Delimiter,
    },
  },
}

export const DelimiterExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension,
}
