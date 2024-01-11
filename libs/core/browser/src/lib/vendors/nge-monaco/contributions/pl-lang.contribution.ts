import { NgeMonacoContribution } from '@cisstech/nge/monaco'
import { resolveFileReference } from '@platon/core/common'
import { PlMonarchLanguage } from './pl-lang.monarch'

const MULTI_LINE_PATTERN = /^[a-zA-Z_](\.?\w+)*\s*==/
const END_MULTI_LINE_PATTERN = /^==\s*$/
const REFERENCE_PATTERN = /(@(?:extends|copyurl|copycontent|include)\s+)([^\s]+)/

export class PlLanguageContribution implements NgeMonacoContribution {
  activate(): void | Promise<void> {
    monaco.languages.register({
      id: 'pl-js',
      extensions: ['.ple'],
    })

    monaco.languages.register({
      id: 'pl-py',
      extensions: ['.ple'],
    })

    monaco.languages.setMonarchTokensProvider('pl-js', PlMonarchLanguage('js'))
    monaco.languages.setMonarchTokensProvider('pl-py', PlMonarchLanguage('py'))

    const configuration: monaco.languages.LanguageConfiguration = {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/'],
      },
      folding: {
        markers: {
          start: new RegExp('^(\\w+)(\\.\\w+)*\\s*=='),
          end: new RegExp('^=='),
        },
      },

      autoClosingPairs: [
        { open: 'grader==', close: '#!lang=js\n==' },
        { open: 'builder==', close: '#!lang=js\n==' },
      ],
    }

    monaco.languages.setLanguageConfiguration('pl-js', configuration)
    monaco.languages.setLanguageConfiguration('pl-py', configuration)

    const referenceLinkProvider: monaco.languages.LinkProvider = {
      provideLinks: (model) => {
        const links: monaco.languages.ILink[] = []
        try {
          const lines: string[] = model.getValue().split('\n')
          const lineCount = lines.length

          let lineIndex = 0
          let match: RegExpExecArray | null

          while (lineIndex < lineCount) {
            if (lines[lineIndex].match(MULTI_LINE_PATTERN)) {
              lineIndex++
              while (lineIndex < lineCount) {
                if (lines[lineIndex].match(END_MULTI_LINE_PATTERN)) {
                  break
                }
                lineIndex++
              }
              if (lineIndex >= lineCount) {
                break
              }
            }

            match = REFERENCE_PATTERN.exec(lines[lineIndex])
            if (match) {
              const url = match.pop()
              if (url) {
                const [resource, version] = model.uri.authority.split(':')
                if (resource && version) {
                  const reference = resolveFileReference(url, { resource, version })
                  const index = lines[lineIndex].indexOf(url)
                  links.push({
                    range: new monaco.Range(lineIndex + 1, index + 1, lineIndex + 1, index + url.length + 2),
                    url: monaco.Uri.parse('platon://' + reference.abspath),
                  })
                }
              }
            }
            lineIndex++
          }
        } catch {
          // TODO freeze on firefox
        }

        return {
          links,
        }
      },
      resolveLink: function (link) {
        return link
      },
    }

    const docLinkProvider: monaco.languages.LinkProvider = {
      provideLinks: (model) => {
        const text = model.getValue()
        const linkPattern = /(\/\/.*?#docs\/(main|components)\/.*)/g
        const links = []
        let match

        while ((match = linkPattern.exec(text)) !== null) {
          const startIndex = model.getPositionAt(match.index)
          const endIndex = model.getPositionAt(match.index + match[0].length)
          const urlMatch = match[0].match(/#docs\/(main|components)\/.*/)
          if (urlMatch) {
            const url = urlMatch[0].slice(1) // remove #
            console.log(url)
            links.push({
              range: new monaco.Range(startIndex.lineNumber, startIndex.column, endIndex.lineNumber, endIndex.column),
              url: monaco.Uri.parse(`https:///${url}`, true),
            })
          }
        }
        return {
          links,
        }
      },
      resolveLink: function (link) {
        return link
      },
    }

    monaco.languages.registerLinkProvider('pl-js', referenceLinkProvider)
    monaco.languages.registerLinkProvider('pl-py', referenceLinkProvider)
    monaco.languages.registerLinkProvider('pl-js', docLinkProvider)
    monaco.languages.registerLinkProvider('pl-py', docLinkProvider)
  }
}
