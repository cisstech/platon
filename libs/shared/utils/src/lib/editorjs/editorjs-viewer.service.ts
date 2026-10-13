// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore : ts-expect-error is not recognized by the linter / no types available for editorjs-parser
import EdjsParser from 'editorjs-parser'
import { ListParser } from './parsers/list-parser'
import { ChecklistParser } from './parsers/checklist-parser'
import { CodeParser } from './parsers/code-parser'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EditorjsBlockParser = (data: any, config?: any) => string

// The library writes the parsers it is given into its own defaults, shared by every parser it builds:
// a copy of them, taken before any is built, keeps each call to its own set.
const DEFAULT_PARSERS: Record<string, EditorjsBlockParser> = { ...new EdjsParser().parsers }

const PARSERS: Record<string, EditorjsBlockParser> = {
  ...DEFAULT_PARSERS,
  list: ListParser,
  checklist: ChecklistParser,
  code: CodeParser,
}

/**
 * The HTML of EditorJS data, a block of an unknown type written as nothing. `parsers` replace the
 * parsers of their block types, for a page that writes them its own way.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editorjsToHtml = (data: any, parsers: Record<string, EditorjsBlockParser> = {}): string => {
  const parser = new EdjsParser()
  parser.parsers = { ...PARSERS, ...parsers }
  return parser.parse(data)
}

export class EditorjsViewerService {
  hasCodeBlock = (data: any): boolean => {
    return data?.blocks?.some((block: any) => block.type === 'code') ?? false
  }

  editorJStoHtml = (data: any) => editorjsToHtml(data)
}
