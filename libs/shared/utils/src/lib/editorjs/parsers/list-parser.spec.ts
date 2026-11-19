import { ListParser } from './list-parser'

describe('ListParser', () => {
  it('closes an ordered list with a bare closing tag', () => {
    const html = ListParser({ style: 'ordered', items: [{ content: 'One', items: [] }] })

    expect(html).toBe('<ol style="padding-left: 1em;"><li>One</li></ol>')
  })

  it('nests a sublist inside the item it belongs to', () => {
    const html = ListParser({
      style: 'unordered',
      items: [{ content: 'Fruits', items: [{ content: 'Apple', items: [] }] }],
    })

    expect(html).toBe(
      '<ul style="padding-left: 1em;"><li>Fruits<ul style="padding-left: 1em;"><li>Apple</li></ul></li></ul>'
    )
  })

  it('reads the items of a flat list, written as plain strings', () => {
    const html = ListParser({ style: 'unordered', items: ['One', 'Two'] })

    expect(html).toBe('<ul style="padding-left: 1em;"><li>One</li><li>Two</li></ul>')
  })
})
