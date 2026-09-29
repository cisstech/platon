// File helpers shared by the lint scripts of the new interface.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.angular', 'coverage', 'fixtures'])

/** Every file under `targets` (files or directories, relative to `root`) with one of `extensions`. */
export const listFiles = (root, targets, extensions) => {
  const found = []
  const visit = (path) => {
    if (!existsSync(path)) return
    if (statSync(path).isDirectory()) {
      for (const entry of readdirSync(path)) {
        if (!SKIPPED_DIRECTORIES.has(entry)) visit(join(path, entry))
      }
    } else if (extensions.includes(extname(path)) && !path.endsWith('.spec.ts')) {
      found.push(path)
    }
  }
  for (const target of targets) visit(join(root, target))
  return found.sort()
}

export const read = (path) => readFileSync(path, 'utf8')

export const relativeTo = (root, path) => relative(root, path)

/** Line number (from 1) of a character offset. */
export const lineAt = (text, offset) => text.slice(0, offset).split('\n').length

/**
 * The stylesheets of a file with their offset in it: the whole file for a stylesheet, the
 * `styles` template literals of a component.
 */
export const styleBlocks = (path, text) => {
  if (path.endsWith('.scss') || path.endsWith('.css')) return [{ css: text, offset: 0 }]
  if (!path.endsWith('.ts')) return []
  const blocks = []
  for (const match of text.matchAll(/styles:\s*\[?\s*`([^`]*)`/g)) {
    blocks.push({ css: match[1], offset: match.index + match[0].indexOf('`') + 1 })
  }
  return blocks
}

/** Comments replaced by spaces, so offsets and line numbers stay right. */
export const withoutComments = (css) =>
  css
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (line, before) => before + ' '.repeat(line.length - before.length))

/**
 * The pieces of a stylesheet between `{`, `;` and `}`, comments removed, each with its offset and the
 * character that ends it: a selector ends with `{`, a declaration with `;` or `}`. Selectors and values
 * spread over several lines stay whole.
 */
export const cssSegments = (css) => {
  const text = withoutComments(css)
  const segments = []
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === '{' || char === ';' || char === '}') {
      const raw = text.slice(start, index)
      const lead = raw.length - raw.trimStart().length
      if (raw.trim()) segments.push({ text: raw.trim(), offset: start + lead, end: char })
      else if (char === '}') segments.push({ text: '', offset: index, end: char })
      start = index + 1
    }
  }
  return segments
}

/** Prints a report in the format shared by the lint scripts, and returns the exit code. */
export const report = ({ title, violations, success, help = [] }) => {
  console.log(`\n  ${title}\n`)
  if (violations.length === 0) {
    console.log(`  ✅  ${success}\n`)
    return 0
  }
  console.log(`  ❌  ${violations.length} violation(s) found:\n`)
  for (const violation of violations) {
    console.log(`  ${violation.location}  ${violation.excerpt ?? ''}`.trimEnd())
    console.log(`  └─ ${violation.message}\n`)
  }
  if (help.length) console.log(help.map((line) => `  ${line}`).join('\n') + '\n')
  return 1
}
