import {
  NgeMarkdownTabbedSetProvider,
  NgeMarkdownAdmonitionsProvider,
  NgeMarkdownLinkAnchorProvider,
  NgeMarkdownKatexProvider,
  NgeMarkdownEmojiProvider,
  NgeMarkdownIconsProvider,
  NgeMarkdownHighlighterProvider,
  NgeMarkdownHighlighterMonacoProvider,
  NgeMarkdownKatexOptionsProvider,
  NgeMarkdownEmojiOptionsProvider,
} from '@cisstech/nge/markdown';

import { NgeMonacoColorizerService } from '@cisstech/nge/monaco';

export const NgeMarkdownProviders = [
  NgeMarkdownKatexProvider,
  NgeMarkdownIconsProvider,
  NgeMarkdownEmojiProvider,
  NgeMarkdownTabbedSetProvider,
  NgeMarkdownLinkAnchorProvider,
  NgeMarkdownAdmonitionsProvider,
  NgeMarkdownHighlighterProvider,
  NgeMarkdownHighlighterMonacoProvider(NgeMonacoColorizerService),
  NgeMarkdownKatexOptionsProvider({
    baseUrl: 'assets/vendors/katex'
  }),
  NgeMarkdownEmojiOptionsProvider({
    url: 'assets/vendors/emoji-toolkit/joypixels.min.js'
  })
];
