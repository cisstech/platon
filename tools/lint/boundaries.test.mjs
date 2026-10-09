// The ESLint boundaries of the new interface and of the design system fail on faulty code.
// Each case lints a faulty text in place of a real file, so the typed parser finds it in its project.
// Run with: node --test tools/lint
import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
// The Nx ESLint configs take the TypeScript root from this variable: pin it to this workspace.
process.env['NX_WORKSPACE_ROOT_PATH'] = root
// On CI, typescript-eslint parses from a program built on the files on disk ("single run"), so the
// first case would lint the real file instead of its faulty text.
process.env['TSESTREE_SINGLE_RUN'] = 'false'

const ruleIdsOf = async (configFile, filePath, code) => {
  const eslint = new ESLint({ cwd: root, overrideConfigFile: configFile })
  const [result] = await eslint.lintText(code, { filePath: resolve(root, filePath) })
  return result.messages.map((message) => `${message.ruleId}: ${message.message}`)
}

describe('boundaries of the new interface', () => {
  const lintNext = (code) => ruleIdsOf('apps/web/eslint.config.mjs', 'apps/web/src/next/next-root.ts', code)

  for (const [name, source] of [
    ['ng-zorro', 'ng-zorro-antd/button'],
    ['Material', '@angular/material/button'],
    ['the ui-* components', '@platon/shared/ui'],
    ['the current interface', '../app/app.config'],
    ['the main entry of @platon/core/browser', '@platon/core/browser'],
    ['the main entry of a feature library', '@platon/feature/result/browser'],
  ]) {
    it(`rejects an import of ${name}`, async () => {
      const messages = await lintNext(`import { x } from '${source}'\nexport const y = x\n`)
      assert.ok(
        messages.some((message) => message.startsWith('no-restricted-imports')),
        messages.join('\n')
      )
    })
  }

  it('accepts the design system, the /shared entries, the CDK and Angular Aria', async () => {
    const messages = await lintNext(
      "import { Icon } from '@platon/design-system'\nimport { DialogService } from '@platon/core/browser/shared'\nimport { ResultService } from '@platon/feature/result/browser/shared'\nimport { Dialog } from '@angular/cdk/dialog'\nimport { Tabs } from '@angular/aria/tabs'\nexport const all = [Icon, DialogService, ResultService, Dialog, Tabs]\n"
    )
    assert.deepEqual(
      messages.filter((message) => message.startsWith('no-restricted-imports')),
      []
    )
  })
})

describe('boundaries of the design system', () => {
  const lintLibrary = (code) =>
    ruleIdsOf('libs/design-system/eslint.config.mjs', 'libs/design-system/src/lib/icon/icon.ts', code)

  it('rejects an import of PLaTon code', async () => {
    const messages = await lintLibrary(
      "import { DialogService } from '@platon/core/browser'\nexport const x = DialogService\n"
    )
    assert.ok(
      messages.some((message) => message.startsWith('no-restricted-imports')),
      messages.join('\n')
    )
  })

  it('rejects a component selector without the pl- prefix', async () => {
    const messages = await lintLibrary(
      "import { ChangeDetectionStrategy, Component } from '@angular/core'\n@Component({ selector: 'app-card', template: '', changeDetection: ChangeDetectionStrategy.OnPush })\nexport class Card {}\n"
    )
    assert.ok(
      messages.some((message) => message.startsWith('@angular-eslint/component-selector')),
      messages.join('\n')
    )
  })

  it('rejects a component that opts out of OnPush, the default since Angular 22', async () => {
    const messages = await lintLibrary(
      "import { ChangeDetectionStrategy, Component } from '@angular/core'\n@Component({ selector: 'pl-card', template: '', changeDetection: ChangeDetectionStrategy.Default })\nexport class Card {}\n"
    )
    assert.ok(
      messages.some((message) => message.startsWith('@angular-eslint/prefer-on-push-component-change-detection')),
      messages.join('\n')
    )
  })
})
