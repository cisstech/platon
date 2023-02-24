/* eslint-disable @typescript-eslint/no-explicit-any */

import { Inject, Injectable, Optional } from '@angular/core';

import EditorJS, { OutputData } from '@editorjs/editorjs';

import DragDrop from 'editorjs-drag-drop';
import Undo from 'editorjs-undo';

import { EditorJsExtension, EDITOR_JS_EXTENSION } from './editorjs';


@Injectable()
export class EditorJsService {
  constructor(
    @Optional()
    @Inject(EDITOR_JS_EXTENSION)
    private readonly extensions: EditorJsExtension[] = []
  ) { }

  newInstance(
    options: {
      data?: OutputData,
      holder?: string,
      readOnly?: boolean,
      onChange?: () => void | Promise<void>,
    }
  ): EditorJS {
    const editor = new EditorJS({
      data: options.data,
      autofocus: true,
      holder: options.holder || 'editorjs',
      inlineToolbar: true,
      minHeight: 400,
      logLevel: 'ERROR' as any,
      readOnly: options.readOnly,
      tools: (this.extensions || []).map(ext => ext.tools)
        .reduce((tools, ext) => {
          Object.assign(tools, ext);
          return tools;
        }, {} as any),
      onReady: () => {
        new Undo({ editor })
        new DragDrop(editor);
      },
      onChange: options.onChange
    });
    return editor;
  }
}
