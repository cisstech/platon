// lint:em-dashes. No em dash (U+2014) or en dash (U+2013) as a separator in the code, the comments
// or the copy of the new interface and its docs.
//
// Flagged: a dash with a non-space character on each side, spaces allowed in between
// ("Texte — autre", "08:00–17:00"). lint-em-dashes: ignore
// Allowed: the lone "no value" placeholder, quoted ('—'), alone in an HTML node (>—<), between
// braces ({ — }) or in a table cell (| — |).
//
// Suppress a false positive with a `lint-em-dashes: ignore` comment on the line.
// Usage: node tools/lint/em-dashes.mjs
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { listFiles, read, relativeTo, report } from './files.mjs'

export const EM_DASHES_CONFIG = {
  targets: [
    'apps/web/src/main.ts',
    'apps/web/src/index.html',
    'apps/web/src/next',
    'apps/web/src/ui-switch',
    'apps/web/src/shared',
    'apps/web/src/app/legacy.bootstrap.ts',
    'apps/web/src/app/legacy.providers.ts',
    'apps/web/src/app/ui-switch',
    'libs/design-system',
    'tools/lint',
    'docs/backlog',
    'design/docs',
    '.claude',
  ],
}

const DASHES = [
  ['—', 'Em dash separator', "Use ':', ',', '(' or '.' instead."],
  ['–', 'En dash separator', "Use '-' (hyphen-minus) instead."],
]

const withoutPlaceholders = (line, dash) =>
  line
    .replace(new RegExp(`${dash}(\\s+${dash})+`, 'g'), '')
    .replace(new RegExp(`(['"\`])\\s*${dash}\\s*\\1`, 'g'), '')
    .replace(new RegExp(`>\\s*${dash}\\s*<`, 'g'), '><')
    .replace(new RegExp(`\\{\\s*${dash}\\s*\\}`, 'g'), '{}')
    .replace(new RegExp(`\\|\\s*${dash}\\s*(?=\\|)`, 'g'), '|')

export const checkEmDashes = (root, config = EM_DASHES_CONFIG) => {
  const violations = []
  const files = listFiles(root, config.targets, [
    '.ts',
    '.html',
    '.scss',
    '.css',
    '.md',
    '.mdx',
    '.mjs',
    '.js',
    '.json',
  ])
  for (const path of files) {
    read(path)
      .split('\n')
      .forEach((line, index) => {
        if (line.includes('lint-em-dashes: ignore')) return
        for (const [dash, label, hint] of DASHES) {
          if (new RegExp(`\\S\\s*${dash}\\s*\\S`).test(withoutPlaceholders(line, dash))) {
            violations.push({
              location: `${relativeTo(root, path)}:${index + 1}`,
              excerpt: line.trim().slice(0, 100),
              message: `${label}. ${hint}`,
            })
          }
        }
      })
  }
  return violations
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  process.exitCode = report({
    title: 'Em and en dashes',
    violations: checkEmDashes(root),
    success: 'No em or en dash separator found.',
    help: [
      "'A — B' becomes 'A: B', 'A, B' or 'A (B)'; 'A–B' becomes 'A-B'.", // lint-em-dashes: ignore
      'To suppress a false positive on a line, add a comment: lint-em-dashes: ignore',
    ],
  })
}
