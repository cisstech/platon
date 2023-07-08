import Code from '@editorjs/code'
import { EditorJsExtension, EDITOR_JS_EXTENSION } from '../editorjs'

const Extension: EditorJsExtension = {
  tools: {
    code: {
      class: Code,
    },
  },
}

export const CodeExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension,
}
