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

const isEditorJsData = (data: unknown): data is OutputData => {
  if (typeof data === 'object') {
    const output = data as OutputData
    if (output?.version && output.blocks) {
      return true
    }
  }
  return false
}

export const editorJsToRawString = (data: string | object): string => {
  if (typeof data === 'string') {
    return data
  }

  if (isEditorJsData(data)) {
    const isRawHTML = data.blocks.length === 1 && data.blocks[0].type === 'raw'
    if (isRawHTML) {
      // we let platon render the raw html instead of render it with editorJs
      return data.blocks[0].data.html
    }
    return JSON.stringify(data, null, 2)
  }

  return JSON.stringify(data, null, 2)
}

export const emptyEditorJsData = () => ({
  time: Date.now(),
  blocks: [],
  version: EditorJsVersion,
})

export const editorJsFromRawString = (data: string): OutputData => {
  if (!data) {
    return emptyEditorJsData()
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
