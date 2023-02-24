import Raw from '@editorjs/raw';
import { EditorJsExtension, EDITOR_JS_EXTENSION } from "../editorjs";

const Extension: EditorJsExtension = {
  tools: {
    raw: {
      class: Raw
    },
  },
}

export const RawExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension
}
