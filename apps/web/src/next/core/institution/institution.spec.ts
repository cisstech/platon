import { readInstitution, readPresentation } from './institution'

const documentWith = (content?: string, name = 'platon-institution') => {
  const doc = document.implementation.createHTMLDocument()
  if (content !== undefined) {
    const meta = doc.createElement('meta')
    meta.name = name
    meta.content = content
    doc.head.append(meta)
  }
  return doc
}

describe('readInstitution', () => {
  it('reads the name of the institution from its meta tag', () => {
    expect(readInstitution(documentWith(' Université Gustave Eiffel '))).toBe('Université Gustave Eiffel')
  })

  it('has no name when the tag is absent or empty', () => {
    expect(readInstitution(documentWith())).toBeUndefined()
    expect(readInstitution(documentWith(''))).toBeUndefined()
  })
})

describe('readPresentation', () => {
  it('reads the address of the presentation from its meta tag, and none when it is empty', () => {
    expect(readPresentation(documentWith('https://video.example/platon', 'platon-presentation'))).toBe(
      'https://video.example/platon'
    )
    expect(readPresentation(documentWith('', 'platon-presentation'))).toBeUndefined()
  })
})
