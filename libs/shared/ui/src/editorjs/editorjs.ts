/* eslint-disable @typescript-eslint/no-explicit-any */
import { InjectionToken } from '@angular/core'
import EditorJS, { BlockToolData, OutputData, ToolConstructable, ToolSettings } from '@editorjs/editorjs'
import { v4 as uuidv4 } from 'uuid'

export const EditorJsVersion = EditorJS.version

export interface EditorJsExtension {
  tools?: {
    [toolName: string]: ToolConstructable | ToolSettings<any>
  }
  parsers?: {
    [toolName: string]: (data: BlockToolData) => string
  }
}

export const EDITOR_JS_REGEX = /^\s*\{[\s\S]*"blocks"\s*:\s*\[[\s\S]*\][\s\S]*\}\s*$/
export const EDITOR_JS_EXTENSION = new InjectionToken<EditorJsExtension[]>('EditorJsExtension')

export const editorJsToRawString = (data: unknown) => {
  if (typeof data === 'string') {
    return data
  }

  const output = data as OutputData
  if (output?.version === EditorJsVersion && output.blocks) {
    if (output.blocks.length === 1 && output.blocks[0].type === 'raw') {
      return output.blocks[0].data.html
    }
    return JSON.stringify(data, null, 2)
  }

  return JSON.stringify(data, null, 2)
}

export const editorJsFromRawString = (data: unknown) => {
  if (!data) {
    return {
      time: Date.now(),
      blocks: [],
      version: EditorJsVersion,
    } as OutputData
  }

  const html = data as string
  if (html.match(EDITOR_JS_REGEX)) {
    return JSON.parse(html)
  }

  return {
    time: Date.now(),
    blocks: [
      {
        id: uuidv4(),
        type: 'raw',
        data: {
          html,
        },
      },
    ],
    version: EditorJsVersion,
  } as OutputData
}
