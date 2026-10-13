import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { EditorOutputData } from '@platon/feature/announcement/common'
import { spoken } from '../../testing/spoken'
import { EditorContent } from './editor-content'

@Component({
  imports: [EditorContent],
  template: `<app-editor-content [content]="content()" [headingLevel]="headingLevel()" />`,
})
class Host {
  readonly content = signal<EditorOutputData>({ blocks: [] })
  readonly headingLevel = signal(2)
}

describe('EditorContent', () => {
  const render = (blocks: EditorOutputData['blocks'], headingLevel = 2) => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(Host)
    fixture.componentInstance.content.set({ blocks })
    fixture.componentInstance.headingLevel.set(headingLevel)
    fixture.detectChanges()
    return fixture.nativeElement.querySelector('.pl-prose') as HTMLElement
  }

  it('writes paragraphs, headings, lists, quotes, code, images and tables in the typography of the page', () => {
    const prose = render([
      { type: 'header', data: { text: 'Ce qui change', level: 2 } },
      { type: 'paragraph', data: { text: 'PLaTon sera <b>indisponible</b>.' } },
      { type: 'list', data: { style: 'ordered', items: [{ content: 'Enregistrez', items: [] }] } },
      { type: 'quote', data: { text: 'Une courte pause.', caption: "L'équipe" } },
      { type: 'code', data: { code: 'print(1)', language: 'python' } },
      { type: 'image', data: { url: 'https://example.org/serveur.png', caption: 'Le serveur' } },
      { type: 'table', data: { content: [['Dimanche', '7 h à 9 h']] } },
    ])

    expect(prose.querySelector('h3')?.textContent).toBe('Ce qui change')
    expect(prose.querySelector('p b')?.textContent).toBe('indisponible')
    expect(prose.querySelector('ol li')?.textContent).toBe('Enregistrez')
    expect(prose.querySelector('blockquote cite')?.textContent).toBe("L'équipe")
    expect(prose.querySelector('pre code')?.textContent).toBe('print(1)')
    expect(prose.querySelector('figure img')?.getAttribute('src')).toBe('https://example.org/serveur.png')
    expect(prose.querySelector('figcaption')?.textContent).toBe('Le serveur')
    expect(prose.querySelector('td')?.textContent).toBe('Dimanche')
  })

  it('puts its headings under the heading it sits beneath, its highest one just below', () => {
    const levels = (blocks: EditorOutputData['blocks'], headingLevel?: number) =>
      [...render(blocks, headingLevel).querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => h.tagName)
    const headings = (...list: number[]) =>
      list.map((level) => ({ type: 'header', data: { text: `Niveau ${level}`, level } }))

    expect(levels(headings(1, 2, 4))).toEqual(['H3', 'H4', 'H6'])
    expect(levels(headings(3, 4))).toEqual(['H3', 'H4'])
    expect(levels(headings(2, 3), 3)).toEqual(['H4', 'H5'])
    expect(levels(headings(1, 6))).toEqual(['H3', 'H6'])
  })

  it('gives a table with headings its header row', () => {
    const prose = render([
      {
        type: 'table',
        data: {
          withHeadings: true,
          content: [
            ['Jour', 'Créneau'],
            ['Dimanche', '7 h à 9 h'],
          ],
        },
      },
    ])

    expect([...prose.querySelectorAll('thead th')].map((th) => th.textContent)).toEqual(['Jour', 'Créneau'])
    expect([...prose.querySelectorAll('tbody td')].map((td) => td.textContent)).toEqual(['Dimanche', '7 h à 9 h'])
  })

  it('reads the caption of an image once, below it', () => {
    const prose = render([
      { type: 'image', data: { url: 'https://example.org/serveur.png', caption: 'Le serveur' } },
      { type: 'image', data: { file: { url: 'https://example.org/salle.png' }, caption: '' } },
    ])

    const [captioned, bare] = [...prose.querySelectorAll('img')]
    expect(captioned.getAttribute('alt')).toBe('')
    expect(spoken(captioned.closest('figure'))).toBe('Le serveur')
    expect(bare.getAttribute('src')).toBe('https://example.org/salle.png')
    expect(bare.closest('figure')?.querySelector('figcaption')).toBeNull()
  })

  it('says which items of a checklist are done, to screen readers too', () => {
    const prose = render([
      {
        type: 'checklist',
        data: {
          items: [
            { text: 'Rendre le TP 3', checked: true },
            { text: 'Lire la correction', checked: false },
          ],
        },
      },
    ])

    const items = [...prose.querySelectorAll('ul.checklist li')]
    expect(items.map((item) => spoken(item))).toEqual(['Fait : Rendre le TP 3', 'À faire : Lire la correction'])
    expect(items[0].classList).toContain('checked')
  })

  it('separates with a rule', () => {
    expect(render([{ type: 'delimiter', data: {} }]).querySelector('hr')).not.toBeNull()
  })

  it('keeps out what the content could run', () => {
    const prose = render([
      {
        type: 'raw',
        data: { html: '<script>window.ran = true</script><img src="x.png" onerror="window.ran = true">' },
      },
      { type: 'paragraph', data: { text: '<a href="javascript:alert(1)">lien</a>' } },
    ])

    expect(prose.querySelector('script')).toBeNull()
    expect(prose.querySelector('img')?.hasAttribute('onerror')).toBe(false)
    expect(prose.querySelector('a')?.getAttribute('href')).toBe('unsafe:javascript:alert(1)')
  })
})
