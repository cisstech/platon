import Checklist from '@editorjs/checklist';
import List from '@editorjs/nested-list';
import { EditorJsExtension, EDITOR_JS_EXTENSION } from "../editorjs";

const Extension: EditorJsExtension = {
  tools: {
    list: {
      class: List,
      inlineToolbar: true,
    },
    checklist: {
      class: Checklist
    },
  },
}

export const ListExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension
}
