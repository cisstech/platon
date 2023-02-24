import Image from '@editorjs/simple-image';
import { EditorJsExtension, EDITOR_JS_EXTENSION } from '../editorjs';

const Extension: EditorJsExtension = {
  tools: {
    image: {
      class: Image
    },
  },
}

export const ImageExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension
}
