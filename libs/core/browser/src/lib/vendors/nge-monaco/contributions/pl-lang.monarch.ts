export const PlMonarchLanguage = (sandbox: 'py' | 'js' = 'js'): monaco.languages.IMonarchLanguage => ({
  /**
   * Identifies a string of characters that start with a letter or underscore and followed
   * by any combination of letters, digits, and underscores.
   * Used to recognize variable names, function names, etc.
   */
  identifier: /([a-zA-Z_]\w*)/,

  /**
   * A list of reserved keywords in the language. Used to highlight them in the editor.
   */
  keywords: [
    'title',
    'form',
    'hint',
    'theories',
    'author',
    'statement',
    'grader',
    'builder',
    'solution',
    'sandbox',
  ],

  /**
   * Recognizes boolean literals, i.e. the values true and false, in all possible case variations.
   */
  boolean: /true|false|True|False/,

  /**
   * Recognizes file operators starting with the @ symbol, followed by one of the allowed operator keywords.
   */
  fileoperator: /@(extends|include|copyurl|copycontent)/,

  /**
   * Recognizes a language declaration at the beginning of a code block.
   * The declaration starts with #!lang= and is followed by a language identifier consisting of one or more alphanumeric characters.
   * Used to highlight code blocks written in different languages.
   */
  language: /\s*#!lang=(\w+)/,

  /**
   * Recognizes escape sequences in strings, including special characters like newline (\n), tab (\t), etc.,
   * as well as hexadecimal and Unicode escape sequences.
   */
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  /**
   * Recognizes integer literals, optionally containing underscores for better readability.
   * Used to highlight integer literals in the editor.
   */
  digits: /\d+(_+\d+)*/,

  /** Recognizes octal integer literals, optionally containing underscores for better readability. */
  octaldigits: /[0-7]+(_+[0-7]+)*/,
  binarydigits: /[0-1]+(_+[0-1]+)*/,
  hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

  tokenizer: {
    root: [
      [/[{}]/, 'delimiter.bracket'],
      { include: '@common' },
    ],
    common: [
      { include: '@whitespace' },

      // keywords
      [/@boolean|@fileoperator/, 'keyword'],

      // components
      [/:(wc+)(-\w+)+/, 'type'],

      // operators
      [
        /@identifier(?=(\s*==))/,
        {
          cases: {
            '$1': {
              cases: {
                'grader': { token: 'type.identifier', next: `@blockcode.${sandbox}` },
                'builder': { token: 'type.identifier', next: `@blockcode.${sandbox}` },
                'form': { token: 'type.identifier', next: '@blockcode.twig' },
                'title': { token: 'type.identifier', next: '@blockcode.twig' },
                'statement': { token: 'type.identifier', next: '@blockcode.twig' },
                'solution': { token: 'type.identifier', next: '@blockcode.twig' },
                '@default': { token: 'identifier', next: '@blockcode.plaintext' }
              }
            }
          }
        }
      ],
      [
        /@identifier/, {
          cases: {
            '@keywords': 'type.identifier',
            '@default': 'identifier',
          }
        }
      ],

      // numbers
      [/(@digits)[eE]([-+]?(@digits))?/, 'number.float'],
      [/(@digits)\.(@digits)([eE][-+]?(@digits))?/, 'number.float'],
      [/0[xX](@hexdigits)/, 'number.hex'],
      [/0[oO]?(@octaldigits)/, 'number.octal'],
      [/0[bB](@binarydigits)/, 'number.binary'],
      [/(@digits)/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/"/, 'string', '@string'],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],

    comment: [
      [/[^/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'], // nested comment
      ["\\*/", 'comment', '@pop'],
      [/[/*]/, 'comment']
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/(#|\/\/).*$/, 'comment'],
    ],

    block: [
      [
        /^==\s*$/,
        {
          token: 'operator',
          next: '@popall',
          nextEmbedded: '@pop',
        }
      ]
    ],

    blockcode: [
      [
        /==(?=@language)/,
        {
          token: 'operator',
          next: '@blockcustom'
        }
      ],
      [
        /==/,
        {
          token: 'operator',
          next: '@block',
          nextEmbedded: '$S2'
        }
      ]
    ],
    blockcustom: [
      [
        /@language/,
        {
          token: 'comment',
          next: '@block',
          nextEmbedded: '$1',
        }
      ]
    ],
  },
})
