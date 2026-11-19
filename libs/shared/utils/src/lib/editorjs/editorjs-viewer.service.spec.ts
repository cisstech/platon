import { EditorjsViewerService, editorjsToHtml } from './editorjs-viewer.service'

const data = {
  blocks: [
    { type: 'header', data: { text: 'Maintenance', level: 2 } },
    { type: 'delimiter', data: {} },
    { type: 'unknown', data: { text: 'ignored' } },
  ],
}

describe('editorjsToHtml', () => {
  it('writes each block it knows, and nothing for the others', () => {
    expect(editorjsToHtml(data)).toBe('<h2>Maintenance</h2><br />')
  })

  it('lets a caller replace the parser of a block type, for its call only', () => {
    expect(editorjsToHtml(data, { delimiter: () => '<hr>' })).toBe('<h2>Maintenance</h2><hr>')
    expect(editorjsToHtml(data)).toBe('<h2>Maintenance</h2><br />')
    expect(new EditorjsViewerService().editorJStoHtml(data)).toBe('<h2>Maintenance</h2><br />')
  })
})
