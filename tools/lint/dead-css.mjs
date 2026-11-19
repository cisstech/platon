// lint:dead-css. A component stylesheet only styles classes its own template can produce.
//
// A dead rule never applies and never breaks anything, so it survives every rename that should
// have removed it, and the next reader trusts it. For each component, every class its styles select
// (the `.scss` next to it, or its inline `styles`) must appear in its template: the `.html` next to
// it, or the `.ts` for inline templates, `[class.x]` bindings and `host` classes.
//
// Limits, on purpose: a rule under `::ng-deep` targets a child's template and is skipped; classes
// the framework writes on our own elements are allowed below; `.a .b` needs both classes.
// Usage: node tools/lint/dead-css.mjs
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { cssSegments, lineAt, listFiles, read, relativeTo, report, styleBlocks } from './files.mjs'

export const DEAD_CSS_CONFIG = {
  targets: ['apps/web/src/next', 'apps/web/src/app/ui-switch', 'libs/design-system/src'],
}

const FRAMEWORK_PREFIXES = {
  'cdk-': 'the Angular CDK writes these on overlays and focus handling',
  'ng-': 'Angular writes these on forms and animations',
}

/** Every class selected in a stylesheet, with its offset, outside `::ng-deep` blocks and at-rules. */
const selectedClasses = (css) => {
  const found = []
  let depth = 0
  let deepDepth = null
  for (const segment of cssSegments(css)) {
    if (segment.end === '{') {
      if (deepDepth === null && segment.text.includes('::ng-deep')) deepDepth = depth
      if (deepDepth === null && !segment.text.startsWith('@')) {
        for (const match of segment.text.matchAll(/\.([a-zA-Z_][\w-]*)/g)) {
          found.push({ name: match[1], offset: segment.offset + match.index })
        }
      }
      depth++
    } else if (segment.end === '}') {
      depth--
      if (deepDepth !== null && depth <= deepDepth) deepDepth = null
    }
  }
  return found
}

export const checkDeadCss = (root, config = DEAD_CSS_CONFIG) => {
  const violations = []
  const files = listFiles(root, config.targets, ['.scss', '.ts']).filter((path) => !path.endsWith('.stories.ts'))
  for (const path of files) {
    const component = path.endsWith('.ts') ? path : path.replace(/\.scss$/, '.ts')
    const template = component.replace(/\.ts$/, '.html')
    if (!existsSync(component) || (path.endsWith('.scss') && !read(component).includes('@Component'))) continue
    const markup = [component, template].filter(existsSync).map(read).join('\n')
    const text = read(path)
    for (const block of styleBlocks(path, text)) {
      for (const { name, offset } of selectedClasses(block.css)) {
        if (Object.keys(FRAMEWORK_PREFIXES).some((prefix) => name.startsWith(prefix))) continue
        if (new RegExp(`(^|[^\\w-])${name}($|[^\\w-])`).test(markup.replace(block.css, ''))) continue
        violations.push({
          location: `${relativeTo(root, path)}:${lineAt(text, block.offset + offset)}`,
          excerpt: `.${name}`,
          message: 'No template of this component can produce this class: the rule never applies',
        })
      }
    }
  }
  return violations
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
  process.exitCode = report({
    title: 'Dead CSS: component styles only select what their template produces',
    violations: checkDeadCss(root),
    success: 'Every component selector is reachable from its own template.',
  })
}
