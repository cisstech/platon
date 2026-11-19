// Each rule of the design lints fails on a faulty file and stays quiet on the right one.
// Run with: node --test tools/lint
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { after, describe, it } from 'node:test'
import { checkDeadCss } from './dead-css.mjs'
import { checkEmDashes } from './em-dashes.mjs'
import { checkTokens } from './tokens.mjs'

const roots = []
after(() => roots.forEach((root) => rmSync(root, { recursive: true, force: true })))

/** A throwaway repository holding `files` (path to content). */
const repository = (files) => {
  const root = mkdtempSync(join(tmpdir(), 'platon-lint-'))
  roots.push(root)
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }
  return root
}

const TOKENS = `:root {
  --pl-color-text: #222125;
  --pl-color-primary: #712f93;
  --pl-space-2: 8px;
  --pl-radius-control: 6px;
  --pl-font-body: 400 14px / 21px sans-serif;
  --pl-duration-hover: 120ms;
}`

const tokenViolations = (css, file = 'src/page.scss') =>
  checkTokens(repository({ 'src/tokens.scss': TOKENS, [file]: css }), {
    targets: ['src'],
    tokensFile: 'src/tokens.scss',
  })

describe('lint:tokens', () => {
  it('accepts tokens, neutral values and the tokens file itself', () => {
    const css = `.a { color: var(--pl-color-text); padding: var(--pl-space-2) 0; border: 1px solid transparent;
      border-radius: var(--pl-radius-control); font: var(--pl-font-body); margin: 0 auto; z-index: 1;
      transition: color var(--pl-duration-hover); }
      @media (prefers-reduced-motion: reduce) { * { transition-duration: 1ms !important; } }`
    assert.deepEqual(tokenViolations(css), [])
  })

  it('rejects a token declared nowhere', () => {
    const [violation] = tokenViolations('.a { color: var(--pl-color-invented); }')
    assert.match(violation.message, /--pl-color-invented is declared nowhere/)
  })

  it('accepts a property set from a template binding', () => {
    const component = `@Component({ host: { '[style.--pl-local]': 'value()' }, styles: \`:host { inline-size: var(--pl-local); }\` })`
    assert.deepEqual(tokenViolations(component, 'src/local.ts'), [])
  })

  it('names the token to use for a wireframe, legacy or earlier name', () => {
    const messages = tokenViolations(
      '.a { color: var(--color-primary); padding: var(--spacing-4); border-radius: var(--pl-radius-sm); background: var(--brand-primary); }'
    ).map((violation) => violation.message)
    assert.equal(messages.length, 4)
    assert.match(messages[0], /Use --pl-color-primary/)
    assert.match(messages[1], /Use --pl-space-4/)
    assert.match(messages[2], /Use --pl-radius-control/)
    assert.match(messages[3], /--pl-color-\* role/)
  })

  const rawValues = [
    ['color', 'color: #ffffff;', /Raw color/],
    ['named color', 'background: white;', /Raw color/],
    ['font', 'font: 600 16px sans-serif;', /Raw font/],
    ['font size', 'font-size: 14px;', /Raw type size/],
    ['weight', 'font-weight: 600;', /Raw weight/],
    ['radius', 'border-radius: 8px;', /Raw radius/],
    ['shadow', 'box-shadow: 0 4px 12px var(--pl-color-text);', /Raw shadow/],
    ['layer', 'z-index: 1000;', /Raw layer/],
    ['duration', 'transition: opacity 200ms ease;', /Raw duration/],
    ['spacing', 'padding: 12px 16px;', /Raw spacing/],
    ['percentage spacing', 'padding: 50%;', /Raw spacing/],
    [
      'duration on a later line',
      'transition:\n    color var(--pl-duration-hover),\n    background-color 300ms;',
      /Raw duration/,
    ],
  ]
  for (const [name, declaration, message] of rawValues) {
    it(`rejects a raw ${name}`, () => {
      const violations = tokenViolations(`.a { ${declaration} }`)
      assert.equal(violations.length, 1, JSON.stringify(violations))
      assert.match(violations[0].message, message)
    })
  }

  it('reads the inline styles of a component', () => {
    const component = 'export const x = { styles: `:host { color: #000; }` }'
    const [violation] = tokenViolations(component, 'src/inline.ts')
    assert.match(violation.message, /Raw color/)
    assert.equal(violation.location, 'src/inline.ts:1')
  })

  it('honours the ignore comment', () => {
    assert.deepEqual(tokenViolations('.a {\n  color: #000; /* lint-tokens: ignore */\n}'), [])
  })
})

describe('lint:em-dashes', () => {
  const dashes = (content) => checkEmDashes(repository({ 'src/copy.ts': content }), { targets: ['src'] })

  it('rejects an em dash between two words', () => {
    assert.equal(dashes("const title = 'Cours — Algorithmique'").length, 1) // lint-em-dashes: ignore
  })

  it('rejects an en dash in a range', () => {
    assert.equal(dashes("const hours = '08:00–17:00'").length, 1) // lint-em-dashes: ignore
  })

  it('accepts the lone placeholder and the ignore comment', () => {
    assert.deepEqual(dashes("const empty = '—'\nconst kept = 'A — B' // lint-em-dashes: ignore"), []) // lint-em-dashes: ignore
  })
})

describe('lint:dead-css', () => {
  const dead = (files) => checkDeadCss(repository(files), { targets: ['src'] })

  it('rejects a class no template produces', () => {
    const violations = dead({
      'src/card.ts': "@Component({ templateUrl: './card.html' })",
      'src/card.html': '<div class="card"></div>',
      'src/card.scss': '.card { display: grid; }\n.card-title { display: block; }',
    })
    assert.deepEqual(
      violations.map((violation) => violation.excerpt),
      ['.card-title']
    )
  })

  it('reads every selector of a list written over several lines', () => {
    const violations = dead({
      'src/card.ts':
        '@Component({ template: \'<div class="card"></div>\' , styles: `.gone,\n.card {\n  display: grid;\n}` })',
    })
    assert.deepEqual(
      violations.map((violation) => violation.excerpt),
      ['.gone']
    )
  })

  it('reads inline templates and styles, bindings, ::ng-deep and framework classes', () => {
    const component = `@Component({
      host: { '[class.is-open]': 'open()' },
      template: '<p class="note"></p>',
      styles: \`.note { display: block; } :host(.is-open) { display: grid; } .cdk-overlay-pane { display: block; }
        ::ng-deep {
          .child-only { display: block; }
        }\`,
    })`
    assert.deepEqual(dead({ 'src/note.ts': component }), [])
  })
})
