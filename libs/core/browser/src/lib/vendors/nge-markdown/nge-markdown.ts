import {
  NgeMarkdownAdmonitionsProvider,
  NgeMarkdownEmojiOptionsProvider,
  NgeMarkdownEmojiProvider,
  NgeMarkdownHighlighterMonacoProvider,
  NgeMarkdownHighlighterProvider,
  NgeMarkdownIconsProvider,
  NgeMarkdownKatexOptionsProvider,
  NgeMarkdownKatexProvider,
  NgeMarkdownLinkAnchorProvider,
  NgeMarkdownTabbedSetProvider,
  NgeMarkdownThemeProvider,
} from '@cisstech/nge/markdown'

import { NgeMonacoColorizerService } from '@cisstech/nge/monaco'

export const NgeMarkdownProviders = [
  NgeMarkdownKatexProvider,
  NgeMarkdownIconsProvider,
  NgeMarkdownEmojiProvider,
  NgeMarkdownTabbedSetProvider,
  NgeMarkdownLinkAnchorProvider,
  NgeMarkdownAdmonitionsProvider,
  NgeMarkdownHighlighterProvider,
  NgeMarkdownHighlighterMonacoProvider(NgeMonacoColorizerService),
  NgeMarkdownThemeProvider({
    name: 'github',
    styleUrl: 'assets/vendors/nge/markdown/themes/github.css',
  }),
  NgeMarkdownKatexOptionsProvider({
    baseUrl: 'assets/vendors/katex',
  }),
  NgeMarkdownEmojiOptionsProvider({
    url: 'assets/vendors/emoji-toolkit/joypixels.min.js',
  }),
]
