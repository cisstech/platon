import { readUiFlag } from './ui-flag'

const documentWith = (head: string): Document =>
  new DOMParser().parseFromString(`<html><head>${head}</head><body></body></html>`, 'text/html')

describe('readUiFlag', () => {
  it('reads the flag from the platon-ui-next meta of index.html', () => {
    expect(readUiFlag(documentWith('<meta name="platon-ui-next" content="opt-in" />'))).toBe('opt-in')
    expect(readUiFlag(documentWith('<meta name="platon-ui-next" content="default" />'))).toBe('default')
  })

  it('is off when the meta is missing', () => {
    expect(readUiFlag(documentWith('<meta name="description" content="PLaTon" />'))).toBe('off')
  })

  it('is off when the value is unknown', () => {
    expect(readUiFlag(documentWith('<meta name="platon-ui-next" content="on" />'))).toBe('off')
  })
})
