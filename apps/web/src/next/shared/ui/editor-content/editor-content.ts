import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { NO_BREAK_SPACE } from '@platon/design-system'
import { EditorOutputData } from '@platon/feature/announcement/common'
import { EditorjsBlockParser, editorjsToHtml } from '@platon/shared/utils'

interface HeaderData {
  readonly text: string
  readonly level: number
}

interface ChecklistData {
  readonly items: { readonly text: string; readonly checked: boolean }[]
}

interface TableData {
  readonly withHeadings?: boolean
  readonly content: string[][]
}

interface ImageData {
  readonly url?: string
  readonly file?: { readonly url: string }
  readonly caption?: string
}

const tableRow = (cells: string[], tag: 'td' | 'th') =>
  `<tr>${cells.map((cell) => `<${tag}>${cell}</${tag}>`).join('')}</tr>`

/**
 * Blocks written for this page. A checklist says each state in words, as its box does to the eye (the
 * sanitizer removes the `<input>` of the shared parser); a delimiter is a rule; a table keeps its
 * header row; an image leaves its caption to its `figcaption`, read once.
 */
const PARSERS: Record<string, EditorjsBlockParser> = {
  checklist: (data: ChecklistData) =>
    `<ul class="checklist">${data.items
      .map((item) => {
        const state = `${item.checked ? 'Fait' : 'À faire'}${NO_BREAK_SPACE}: `
        return `<li class="checklist-item${
          item.checked ? ' checked' : ''
        }"><span class="pl-visually-hidden">${state}</span>${item.text}</li>`
      })
      .join('')}</ul>`,
  delimiter: () => '<hr>',
  table: (data: TableData) => {
    const [first = [], ...others] = data.content
    const head = data.withHeadings ? `<thead>${tableRow(first, 'th')}</thead>` : ''
    const body = (data.withHeadings ? others : data.content).map((cells) => tableRow(cells, 'td')).join('')
    return `<table>${head}<tbody>${body}</tbody></table>`
  },
  image: (data: ImageData) => {
    const caption = data.caption ? `<figcaption>${data.caption}</figcaption>` : ''
    return `<figure><img src="${data.url ?? data.file?.url ?? ''}" alt="">${caption}</figure>`
  },
}

/**
 * The headings of the content under a heading of level `under`: its highest heading (`top`) just
 * below, the others as far beneath it as they were, the deepest at 6.
 */
const header =
  (under: number, top: number): EditorjsBlockParser =>
  (data: HeaderData) => {
    const level = Math.min(6, data.level - top + under + 1)
    return `<h${level}>${data.text}</h${level}>`
  }

/** The level of the highest heading of the content. */
const topLevel = (content: EditorOutputData) =>
  Math.min(6, ...content.blocks.filter(({ type }) => type === 'header').map(({ data }) => Number(data['level']) || 6))

/**
 * Content written in the editor of the platform (EditorJS blocks), an announcement for instance, turned
 * into HTML and set in the typography of the design system (`pl-prose`), its headings under the
 * heading it sits beneath (`headingLevel`). The HTML goes through the sanitizer of Angular: what could
 * run is left out.
 */
@Component({
  selector: 'app-editor-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editor-content.html',
})
export class EditorContent {
  readonly content = input.required<EditorOutputData>()
  /** The level of the heading the content sits beneath. */
  readonly headingLevel = input(2)

  protected readonly html = computed(() => {
    const content = this.content()
    return editorjsToHtml(content, { ...PARSERS, header: header(this.headingLevel(), topLevel(content)) })
  })
}
