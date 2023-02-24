/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken } from '@angular/core';
import { BlockToolData, ToolConstructable, ToolSettings } from '@editorjs/editorjs';

export interface EditorJsExtension {
  tools?: {
    [toolName: string]: ToolConstructable | ToolSettings<any>;
  },
  parsers?: {
    [toolName: string]: (data: BlockToolData) => string;
  }
}

export const EDITOR_JS_EXTENSION = new InjectionToken<EditorJsExtension[]>('EditorJsExtension');
