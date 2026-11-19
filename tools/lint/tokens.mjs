// lint:tokens. The styles of the new interface use the design system tokens, and only them.
//
//   1. UNDECLARED: every `var(--x)` resolves to a custom property declared in the scanned sources
//      (the tokens, or a component's own property) or set from a template binding. An undeclared
//      token fails silently: the declaration is dropped and the browser falls back to its default.
//   2. FOREIGN: names from other systems (the wireframes, the current interface, Material,
//      ng-zorro) or from an earlier naming of the tokens, reported with the token to use.
//   3. HARD-CODED: a color, font, radius, shadow, layer, duration or spacing written as a raw value
//      where a token exists. `1ms` stays allowed: it is how reduced motion switches animations off.
//
// Suppress a false positive with a `lint-tokens: ignore` comment on the line.
// Usage: node tools/lint/tokens.mjs
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { cssSegments, lineAt, listFiles, read, relativeTo, report, styleBlocks } from './files.mjs'

export const TOKENS_CONFIG = {
  targets: ['apps/web/src/next', 'libs/design-system/src', 'libs/design-system/.storybook'],
  // The only file allowed to hold raw values: it declares them.
  tokensFile: 'libs/design-system/src/styles/tokens.scss',
}

const RADIUS_BY_SIZE = {
  xs: '--pl-radius-1',
  sm: '--pl-radius-control',
  md: '--pl-radius-menu',
  lg: '--pl-radius-card',
  full: '--pl-radius-pill',
}

/** [pattern, suggestion]: the suggestion receives the regex match. */
const FOREIGN = [
  [
    /^--pl-(encre|validation|correction|attention|repere)-(\d+)$/,
    (m) =>
      `--pl-${{ encre: 'plum', validation: 'green', correction: 'red', attention: 'ochre', repere: 'blue' }[m[1]]}-${
        m[2]
      }`,
  ],
  [
    /^--pl-course-(corail|ambre|menthe|lagon|bleuet|lilas|framboise)-(tint|strong|ink)$/,
    (m) =>
      `--pl-course-${
        {
          corail: 'coral',
          ambre: 'amber',
          menthe: 'mint',
          lagon: 'lagoon',
          bleuet: 'cornflower',
          lilas: 'lilac',
          framboise: 'raspberry',
        }[m[1]]
      }-${m[2]}`,
  ],
  [/^--pl-radius-(xs|sm|md|lg|full)$/, (m) => RADIUS_BY_SIZE[m[1]]],
  [/^--pl-icon-size-(sm|md|lg)$/, (m) => `--pl-icon-size-${{ sm: 1, md: 2, lg: 3 }[m[1]]}`],
  [/^--pl-(z|z-index|zindex)-/, () => 'a --pl-layer-* token'],
  [/^--pl-spacing-(\d+)$/, (m) => `--pl-space-${m[1]}`],
  [/^--color-([\w-]+)$/, (m) => `--pl-color-${m[1]} (the wireframe names take the --pl- prefix)`],
  [/^--spacing-(\d+)$/, (m) => `--pl-space-${m[1]}`],
  [/^--rounded-(xs|sm|md|lg|full)$/, (m) => RADIUS_BY_SIZE[m[1]]],
  [/^--font-([\w-]+)$/, (m) => `--pl-font-${m[1]}`],
  [/^--brand-/, () => 'a --pl-color-* role: --brand-* belongs to the current interface'],
  [/^--(mat|mdc|ant)-/, () => 'a --pl-* token: Material and ng-zorro stay in the current interface'],
  [/^--(space|size|radius|shadow|z|duration|ease|text)-/, (m) => `the --pl-${m[1]}-* scale, if it exists`],
]

const COLOR_PROPERTIES =
  /^(color|background(-color)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|fill|stroke|caret-color|accent-color|text-decoration(-color)?|column-rule(-color)?|box-shadow|text-shadow)$/
const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i
const NAMED_COLOR =
  /(^|[\s,(])(white|black|red|green|blue|gray|grey|silver|orange|yellow|purple|pink|violet|navy|teal)(?=$|[\s,)])/i
const LENGTH = /(^|[^\w-])-?\d*\.?\d+(px|rem|em|pt|%|vh|vw|ch)(?![\w-])/
const DURATION = /(^|[^\w-])\d*\.?\d+(ms|s)\b/
const UNITLESS_NUMBER = /^-?\d*\.?\d+$/

/** The rule a declaration breaks, if any. */
const hardCoded = (property, value) => {
  const v = value.trim()
  if (/^(inherit|initial|unset|revert|none|0|auto|normal)$/i.test(v)) return null
  if (COLOR_PROPERTIES.test(property) && (RAW_COLOR.test(v) || NAMED_COLOR.test(v))) {
    return 'Raw color: use a --pl-color-* role (or a --pl-course-* color)'
  }
  if (property === 'font' && !/^var\(--pl-font-/.test(v))
    return 'Raw font: use font: var(--pl-font-body) and its siblings'
  if (property === 'font-family' && !/^var\(--pl-font-(sans|mono)\)$/.test(v))
    return 'Raw font family: use var(--pl-font-sans) or var(--pl-font-mono)'
  if (/^(font-size|line-height)$/.test(property) && (LENGTH.test(v) || UNITLESS_NUMBER.test(v))) {
    return 'Raw type size: use a --pl-font-* token, which sets size and line height together'
  }
  if (property === 'font-weight' && /^\d+$|^bold(er)?$|^lighter$/.test(v))
    return 'Raw weight: use var(--pl-weight-regular) or var(--pl-weight-strong)'
  if (property === 'letter-spacing' && LENGTH.test(v)) return 'Raw tracking: use a --pl-tracking-* token'
  if (/radius$/.test(property) && LENGTH.test(v))
    return 'Raw radius: use a --pl-radius-* role (control, menu, card, pill)'
  if (/^(box-shadow|text-shadow)$/.test(property) && LENGTH.test(v))
    return 'Raw shadow: use var(--pl-shadow-float) or var(--pl-shadow-overlay)'
  if (property === 'z-index' && UNITLESS_NUMBER.test(v) && Math.abs(Number(v)) > 1)
    return 'Raw layer: use a --pl-layer-* token'
  if (
    /^(transition|transition-duration|transition-delay|animation|animation-duration|animation-delay)$/.test(property) &&
    DURATION.test(v.replace(/(^|[^\w-])(0m?s|1ms)\b/g, ''))
  ) {
    return 'Raw duration: use a --pl-duration-* token'
  }
  if (
    /^(margin|padding)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$|^(gap|row-gap|column-gap)$/.test(
      property
    ) &&
    LENGTH.test(v.replace(/(^|[^\w-])-?1px\b/g, ''))
  ) {
    return 'Raw spacing: use a --pl-space-* step'
  }
  return null
}

const ignored = (text, offset) => {
  const start = text.lastIndexOf('\n', offset) + 1
  const end = text.indexOf('\n', offset)
  return text.slice(start, end === -1 ? undefined : end).includes('lint-tokens: ignore')
}

const foreignSuggestion = (name) => {
  for (const [pattern, suggest] of FOREIGN) {
    const match = name.match(pattern)
    if (match) return suggest(match)
  }
  return null
}

export const checkTokens = (root, config = TOKENS_CONFIG) => {
  const tokensPath = resolve(root, config.tokensFile)
  const files = listFiles(root, config.targets, ['.scss', '.css', '.ts', '.html', '.mdx'])
  const sources = [tokensPath, ...files.filter((file) => file !== tokensPath)].map((path) => ({
    path,
    text: read(path),
  }))

  const declared = new Set()
  for (const { text } of sources) {
    for (const match of text.matchAll(/(--[\w-]+)\s*:/g)) declared.add(match[1])
    for (const match of text.matchAll(/\[style\.(--[\w-]+)\]/g)) declared.add(match[1])
    for (const match of text.matchAll(/setProperty\(\s*['"](--[\w-]+)/g)) declared.add(match[1])
  }

  const violations = []
  const add = (path, text, offset, message) => {
    if (ignored(text, offset)) return
    const line = text.split('\n')[lineAt(text, offset) - 1].trim()
    violations.push({
      location: `${relativeTo(root, path)}:${lineAt(text, offset)}`,
      excerpt: line.slice(0, 100),
      message,
    })
  }

  for (const { path, text } of sources) {
    for (const match of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
      const name = match[1]
      const suggestion = foreignSuggestion(name)
      if (suggestion) add(path, text, match.index, `${name} is not a token of PLaTon. Use ${suggestion}`)
      else if (!declared.has(name))
        add(path, text, match.index, `${name} is declared nowhere, so every declaration using it is dropped`)
    }

    if (path === tokensPath) continue
    for (const block of styleBlocks(path, text)) {
      for (const segment of cssSegments(block.css)) {
        if (segment.end === '{') continue
        const declaration = segment.text.match(/^([a-z-]+)\s*:\s*([\s\S]+)$/)
        if (!declaration) continue
        const rule = hardCoded(declaration[1], declaration[2].replace(/\s+/g, ' '))
        if (rule) add(path, text, block.offset + segment.offset, rule)
      }
    }
  }
  return violations
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  process.exitCode = report({
    title: 'Design tokens: the new interface uses PLaTon tokens, and only them',
    violations: checkTokens(root),
    success: 'Every var() resolves to a PLaTon token, and no raw value stands in for one.',
    help: [
      'Tokens: libs/design-system/src/styles/tokens.scss, listed in Storybook under Foundations/Tokens.',
      'Scales are numbered (--pl-space-4, --pl-radius-2), roles are named (--pl-color-primary, --pl-radius-card).',
      'A property set from a template binding ([style.--x]) counts as declared.',
      'To suppress a false positive on a line, add a comment: lint-tokens: ignore',
    ],
  })
}
