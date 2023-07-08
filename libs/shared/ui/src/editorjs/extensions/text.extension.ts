import Header from '@editorjs/header'
import Marker from '@editorjs/marker'
import Paragraph from '@editorjs/paragraph'
import TextVariant from '@editorjs/text-variant-tune'
import Underline from '@editorjs/underline'
import { StyleInlineTool } from 'editorjs-style'
import TextAlignment from 'editorjs-text-alignment-blocktune'
import TextColor from 'editorjs-text-color-plugin'
import { EditorJsExtension, EDITOR_JS_EXTENSION } from '../editorjs'

const Extension: EditorJsExtension = {
  tools: {
    header: {
      class: Header,
      inlineToolbar: true,
      tunes: ['textVariant', 'textAlignment'],
    },
    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      tunes: ['textVariant', 'textAlignment'],
    },

    style: {
      class: StyleInlineTool,
    },
    marker: {
      class: Marker,
      inlineToolbar: true,
    },
    underline: {
      class: Underline,
      inlineToolbar: true,
    },

    textColor: {
      class: TextColor,
      config: {
        customPicker: true,
      },
    },
    textVariant: {
      class: TextVariant,
    },
    textAlignment: {
      class: TextAlignment,
      config: {
        default: 'left',
      },
    },
  },
}

export const TextExtension = {
  provide: EDITOR_JS_EXTENSION,
  multi: true,
  useValue: Extension,
}
