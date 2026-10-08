import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core'
import { Glyph, GlyphName } from '../glyph/glyph'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

/** The color of the pastille: `neutral` when nothing can be created, `danger` for an error. */
export type EmptyTone = 'neutral' | 'danger'

/**
 * A place with nothing in it, or a place that failed, on a card: a figure, a heading, why, and what
 * to do.
 * The figure is the blank paper illustration by default, the glyph of the object it would hold with
 * `glyph`, or an icon in a pastille with `icon`, when there is nothing to create. The text goes in
 * the content, the actions with `plEmptyAction`. An error takes `role="alert"`; a page error shows its
 * `code` in small.
 */
@Component({
  selector: 'pl-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Glyph, Icon],
  host: {
    class: 'pl-empty',
    '[attr.data-figure]': "icon() ? 'icon' : glyph() ? 'glyph' : 'illustration'",
    '[attr.data-compact]': "compact() ? '' : null",
  },
  template: `
    <div class="pl-empty__layout">
      @if (icon(); as icon) {
      <span class="pl-empty__pastille" [attr.data-tone]="tone()">
        <pl-icon [name]="icon" [size]="4" />
      </span>
      } @else if (glyph(); as glyph) {
      <pl-glyph class="pl-empty__glyph" [name]="glyph" [size]="2" />
      } @else {
      <svg class="pl-empty__illustration" viewBox="0 0 168 128" aria-hidden="true" focusable="false">
        <rect class="e-paper" x="24" y="8" width="112" height="112" rx="6" stroke-width="2" />
        <line class="e-margin" x1="52" y1="8" x2="52" y2="120" stroke-width="2" />
        <line class="e-rule" x1="64" y1="40" x2="120" y2="40" stroke-width="3" stroke-linecap="round" />
        <line class="e-rule" x1="64" y1="58" x2="112" y2="58" stroke-width="3" stroke-linecap="round" />
        <line class="e-rule" x1="64" y1="76" x2="120" y2="76" stroke-width="3" stroke-linecap="round" />
        <line class="e-rule" x1="64" y1="94" x2="96" y2="94" stroke-width="3" stroke-linecap="round" />
        <g transform="rotate(-38 132 88)">
          <rect class="e-warm" x="124" y="46" width="16" height="66" rx="2" />
          <rect class="e-eraser" x="124" y="46" width="16" height="10" rx="2" />
          <path class="e-wood" d="M124 112 L132 126 L140 112 Z" />
          <path class="e-lead" d="M129 121 L132 126 L135 121 Z" />
        </g>
      </svg>
      }
      <div class="pl-empty__body">
        @if (level() === 3) {
        <h3 class="pl-empty__heading">{{ heading() }}</h3>
        } @else {
        <h2 class="pl-empty__heading">{{ heading() }}</h2>
        }
        <div class="pl-empty__text"><ng-content /></div>
        <div class="pl-empty__actions"><ng-content select="[plEmptyAction]" /></div>
        @if (code()) {
        <p class="pl-empty__code">{{ code() }}</p>
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      container-type: inline-size;
      max-inline-size: 720px;
      border: 1px solid var(--pl-color-line);
      border-radius: var(--pl-radius-card);
      background: var(--pl-color-surface);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    .pl-empty__layout {
      display: grid;
      grid-template-columns: 168px minmax(0, 1fr);
      gap: var(--pl-space-6);
      align-items: center;
      padding: var(--pl-space-6) var(--pl-space-8);
    }
    :host([data-compact]) .pl-empty__layout {
      grid-template-columns: 112px minmax(0, 1fr);
      padding: var(--pl-space-4) var(--pl-space-5);
    }
    :host([data-figure='glyph']) .pl-empty__layout,
    :host([data-figure='icon']) .pl-empty__layout {
      grid-template-columns: var(--pl-glyph-size-2) minmax(0, 1fr);
      align-items: start;
    }
    .pl-empty__illustration {
      inline-size: 100%;
      block-size: auto;
    }
    .pl-empty__pastille {
      display: grid;
      place-items: center;
      inline-size: var(--pl-glyph-size-2);
      block-size: var(--pl-glyph-size-2);
      border-radius: var(--pl-radius-card);
      background: var(--pl-color-hover);
      color: var(--pl-color-muted);
    }
    .pl-empty__pastille[data-tone='danger'] {
      background: var(--pl-color-danger-soft);
      color: var(--pl-color-danger);
    }
    .pl-empty__body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--pl-space-3);
    }
    .pl-empty__heading {
      font: var(--pl-font-heading);
    }
    .pl-empty__text {
      display: grid;
      gap: var(--pl-space-2);
      max-inline-size: 56ch;
      color: var(--pl-color-muted);
    }
    .pl-empty__text:empty,
    .pl-empty__actions:empty {
      display: none;
    }
    .pl-empty__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--pl-space-2);
    }
    .pl-empty__code {
      color: var(--pl-color-subtle);
      font: var(--pl-font-small);
    }
    .e-paper {
      fill: var(--pl-color-surface);
      stroke: var(--pl-color-line-strong);
    }
    .e-margin {
      stroke: var(--pl-color-margin);
    }
    .e-rule {
      stroke: var(--pl-color-line);
    }
    .e-warm {
      fill: var(--pl-color-joy-2);
    }
    .e-eraser {
      fill: var(--pl-course-raspberry-tint);
    }
    .e-wood {
      fill: var(--pl-color-line);
    }
    .e-lead {
      fill: var(--pl-color-muted);
    }
    @container (max-width: 480px) {
      .pl-empty__layout,
      :host([data-compact]) .pl-empty__layout {
        grid-template-columns: minmax(0, 1fr);
        justify-items: start;
        gap: var(--pl-space-4);
        padding: var(--pl-space-5) var(--pl-space-4);
      }
      .pl-empty__illustration {
        inline-size: 112px;
      }
    }
  `,
})
export class Empty {
  readonly heading = input.required<string>()
  /** Level of the heading: 2 for a page or a card, 3 for a zone under a section title. */
  readonly level = input<2 | 3>(2)
  readonly glyph = input<GlyphName>()
  readonly icon = input<IconName>()
  readonly tone = input<EmptyTone>('neutral')
  /** The code of a page error, such as « Erreur 503 », in small under the actions. */
  readonly code = input<string>()
  /** The smaller form, inside a zone of a page. */
  readonly compact = input(false, { transform: booleanAttribute })
}
