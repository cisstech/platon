import { ChangeDetectionStrategy, Component } from '@angular/core'
import type { Meta, StoryObj } from '@storybook/angular'

type TokenKind = 'color' | 'font' | 'space' | 'radius' | 'shadow' | 'size' | 'plain'

interface TokenGroup {
  title: string
  kind: TokenKind
  names: string[]
}

const GROUPS: { title: string; kind: TokenKind; prefixes: string[] }[] = [
  { title: 'Color roles', kind: 'color', prefixes: ['--pl-color-'] },
  { title: 'Course colors', kind: 'color', prefixes: ['--pl-course-'] },
  {
    title: 'Palette',
    kind: 'color',
    prefixes: ['--pl-plum-', '--pl-graphite-', '--pl-green-', '--pl-red-', '--pl-ochre-', '--pl-blue-'],
  },
  { title: 'Typography', kind: 'font', prefixes: ['--pl-font-'] },
  { title: 'Spacing', kind: 'space', prefixes: ['--pl-space-'] },
  { title: 'Radii', kind: 'radius', prefixes: ['--pl-radius-'] },
  { title: 'Shadows', kind: 'shadow', prefixes: ['--pl-shadow-float', '--pl-shadow-overlay'] },
  { title: 'Sizes', kind: 'size', prefixes: ['--pl-icon-size-', '--pl-cover-', '--pl-topbar-', '--pl-answer-'] },
  { title: 'Motion', kind: 'plain', prefixes: ['--pl-duration-', '--pl-ease-'] },
  { title: 'Layers', kind: 'plain', prefixes: ['--pl-layer-'] },
  { title: 'Weights and tracking', kind: 'plain', prefixes: ['--pl-weight-', '--pl-tracking-'] },
]

/** Every `--pl-*` custom property declared on `:root` by the loaded stylesheets. */
const declaredTokens = (): string[] => {
  const names = new Set<string>()
  const walk = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText === ':root') {
        for (const property of Array.from(rule.style)) if (property.startsWith('--pl-')) names.add(property)
      } else if (rule instanceof CSSGroupingRule) {
        walk(rule.cssRules)
      }
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules)
    } catch {
      // A stylesheet of another origin cannot be read.
    }
  }
  return [...names]
}

const tokenGroups = (): TokenGroup[] => {
  const tokens = declaredTokens()
  return GROUPS.map((group) => ({
    title: group.title,
    kind: group.kind,
    names: tokens.filter((name) => group.prefixes.some((prefix) => name.startsWith(prefix))),
  })).filter((group) => group.names.length > 0)
}

@Component({
  selector: 'pl-tokens-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="pl-text-display">Tokens</h1>
    <p class="pl-text-muted intro">
      Every <code>--pl-*</code> variable of the stylesheet, with its value in the current theme.
    </p>
    @for (group of groups; track group.title) {
    <section>
      <h2 class="pl-text-title">{{ group.title }}</h2>
      <ul>
        @for (name of group.names; track name) {
        <li>
          <span [class]="'preview preview--' + group.kind" [style]="preview(group.kind, name)">
            @if (group.kind === 'font') { Algorithms 1, 87 out of 100 }
          </span>
          <code>{{ name }}</code>
          <span class="value">{{ value(name) }}</span>
        </li>
        }
      </ul>
    </section>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--pl-space-8);
      max-inline-size: 960px;
    }
    .intro {
      margin-block-start: calc(var(--pl-space-2) * -1);
    }
    section {
      display: grid;
      gap: var(--pl-space-3);
    }
    ul {
      display: grid;
      grid-template-columns: max-content max-content minmax(0, 1fr);
      gap: var(--pl-space-2) var(--pl-space-4);
      padding: 0;
      list-style: none;
    }
    li {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      align-items: center;
    }
    code {
      font: var(--pl-font-code);
    }
    .value {
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
      overflow-wrap: anywhere;
    }
    .preview--color,
    .preview--radius,
    .preview--shadow {
      inline-size: var(--pl-space-12);
      block-size: var(--pl-space-8);
      border: 1px solid var(--pl-color-line-strong);
      border-radius: var(--pl-radius-control);
    }
    .preview--radius {
      border-color: var(--pl-color-control);
      background: var(--pl-color-primary-soft);
    }
    .preview--shadow {
      border: 0;
      background: var(--pl-color-surface-raised);
    }
    .preview--space,
    .preview--size {
      block-size: var(--pl-space-2);
      border-radius: var(--pl-radius-pill);
      background: var(--pl-color-primary);
    }
  `,
})
class TokensPage {
  protected readonly groups = tokenGroups()
  private readonly computed = getComputedStyle(document.documentElement)

  protected preview(kind: TokenKind, name: string): Record<string, string> {
    const token = `var(${name})`
    if (name === '--pl-font-sans' || name === '--pl-font-mono') return { 'font-family': token }
    const property = {
      color: 'background',
      font: 'font',
      space: 'inline-size',
      size: 'inline-size',
      radius: 'border-radius',
      shadow: 'box-shadow',
      plain: '',
    }[kind]
    return property ? { [property]: token } : {}
  }

  protected value(name: string): string {
    return this.computed.getPropertyValue(name).trim()
  }
}

const meta: Meta<TokensPage> = {
  title: 'Foundations/Tokens',
  component: TokensPage,
  parameters: { layout: 'padded' },
}

export default meta

export const Tokens: StoryObj<TokensPage> = {}
