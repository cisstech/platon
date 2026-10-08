import { readInstitution } from './institution'

describe('readInstitution', () => {
  const documentWith = (content?: string) => {
    const doc = document.implementation.createHTMLDocument()
    if (content !== undefined) {
      const meta = doc.createElement('meta')
      meta.name = 'platon-institution'
      meta.content = content
      doc.head.append(meta)
    }
    return doc
  }

  it('reads the name of the institution from its meta tag', () => {
    expect(readInstitution(documentWith(' Université Gustave Eiffel '))).toBe('Université Gustave Eiffel')
  })

  it('has no name when the tag is absent or empty', () => {
    expect(readInstitution(documentWith())).toBeUndefined()
    expect(readInstitution(documentWith(''))).toBeUndefined()
  })
})
