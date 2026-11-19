import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/** The five objects of PLaTon, drawn in the style of the illustrations. */
export type GlyphName = 'course' | 'activity' | 'exercise' | 'circle' | 'paper'

/** A step of the `--pl-glyph-size-*` scale: 40 and 56 px. */
export type GlyphSize = 1 | 2

/**
 * A PLaTon glyph, for the large sizes: empty states, the Create menu, the choice of an object to
 * create. Its colors are roles of the tokens, so it follows the theme. Decorative unless it has a
 * `label`.
 */
@Component({
  selector: 'pl-glyph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-size]': 'size()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': "label() ? null : 'true'",
  },
  template: `
    @switch (name()) { @case ('course') {
    <svg viewBox="0 0 48 48" focusable="false">
      <rect class="g-paper g-outline" x="8" y="6" width="30" height="36" rx="3" stroke-width="1.5" />
      <line class="g-rule-strong" x1="15" y1="6" x2="15" y2="42" stroke-width="1.5" />
      <circle class="g-outline-fill" cx="11.5" cy="14" r="1.5" />
      <circle class="g-outline-fill" cx="11.5" cy="24" r="1.5" />
      <circle class="g-outline-fill" cx="11.5" cy="34" r="1.5" />
      <line class="g-rule" x1="20" y1="16" x2="32" y2="16" stroke-width="2" stroke-linecap="round" />
      <line class="g-rule" x1="20" y1="22" x2="32" y2="22" stroke-width="2" stroke-linecap="round" />
      <line class="g-rule" x1="20" y1="28" x2="28" y2="28" stroke-width="2" stroke-linecap="round" />
      <path class="g-warm" d="M38 11h3.5a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H38Z" />
    </svg>
    } @case ('activity') {
    <svg viewBox="0 0 48 48" focusable="false">
      <rect class="g-paper g-rule-strong" x="14" y="5" width="26" height="32" rx="2.5" stroke-width="1.5" />
      <rect class="g-paper g-outline" x="8" y="11" width="26" height="32" rx="2.5" stroke-width="1.5" />
      <line class="g-margin" x1="14" y1="11" x2="14" y2="43" stroke-width="1.5" />
      <line class="g-rule" x1="18" y1="21" x2="29" y2="21" stroke-width="2" stroke-linecap="round" />
      <line class="g-rule" x1="18" y1="27" x2="29" y2="27" stroke-width="2" stroke-linecap="round" />
      <line class="g-rule" x1="18" y1="33" x2="25" y2="33" stroke-width="2" stroke-linecap="round" />
      <path
        class="g-warm-stroke"
        d="M24 16V7.5a3 3 0 0 1 6 0V17a4.5 4.5 0 0 1-9 0V9"
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
    } @case ('exercise') {
    <svg viewBox="0 0 48 48" focusable="false">
      <rect class="g-paper g-outline" x="10" y="6" width="28" height="36" rx="2.5" stroke-width="1.5" />
      <line class="g-margin" x1="17" y1="6" x2="17" y2="42" stroke-width="1.5" />
      <path
        class="g-ink"
        d="M25 16.5l-4 4 4 4M30 16.5l4 4-4 4"
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <line class="g-rule" x1="21" y1="31" x2="33" y2="31" stroke-width="2" stroke-linecap="round" />
      <rect class="g-warm" x="21" y="35" width="8" height="3" rx="1.5" />
    </svg>
    } @case ('circle') {
    <svg viewBox="0 0 48 48" focusable="false">
      <circle class="g-rule" cx="24" cy="25" r="20" fill="none" stroke-width="1.5" />
      <circle class="g-paper g-outline" cx="13" cy="19" r="4.5" stroke-width="1.5" />
      <path class="g-paper g-outline" d="M5 34a8 8 0 0 1 16 0" stroke-width="1.5" stroke-linecap="round" />
      <circle class="g-paper g-outline" cx="35" cy="19" r="4.5" stroke-width="1.5" />
      <path class="g-paper g-outline" d="M27 34a8 8 0 0 1 16 0" stroke-width="1.5" stroke-linecap="round" />
      <circle class="g-warm" cx="24" cy="23" r="5.5" />
      <path class="g-warm" d="M14 40a10 10 0 0 1 20 0Z" />
    </svg>
    } @case ('paper') {
    <svg viewBox="0 0 48 48" focusable="false">
      <rect class="g-paper g-outline" x="7" y="6" width="28" height="36" rx="2.5" stroke-width="1.5" />
      <line class="g-margin" x1="14" y1="6" x2="14" y2="42" stroke-width="1.5" />
      <line class="g-rule" x1="18" y1="15" x2="30" y2="15" stroke-width="2" stroke-linecap="round" />
      <line class="g-rule" x1="18" y1="21" x2="30" y2="21" stroke-width="2" stroke-linecap="round" />
      <line class="g-rule" x1="18" y1="27" x2="26" y2="27" stroke-width="2" stroke-linecap="round" />
      <path
        class="g-mark"
        d="M18.5 33.5l2.5 2.5 5-6"
        fill="none"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <g transform="rotate(30 38 26)">
        <rect class="g-warm" x="35.5" y="12" width="5" height="20" rx="1" />
        <rect class="g-eraser" x="35.5" y="12" width="5" height="3.5" rx="1" />
        <path class="g-rule-fill" d="M35.5 32L38 37.5 40.5 32Z" />
        <path class="g-ink-fill" d="M37.1 35.5L38 37.5 38.9 35.5Z" />
      </g>
    </svg>
    } }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      inline-size: var(--pl-glyph-size-1);
      block-size: var(--pl-glyph-size-1);
    }
    :host([data-size='2']) {
      inline-size: var(--pl-glyph-size-2);
      block-size: var(--pl-glyph-size-2);
    }
    svg {
      inline-size: 100%;
      block-size: 100%;
    }
    .g-paper {
      fill: var(--pl-color-surface);
    }
    .g-outline {
      stroke: var(--pl-color-control);
    }
    .g-outline-fill {
      fill: var(--pl-color-control);
    }
    .g-rule {
      stroke: var(--pl-color-line);
    }
    .g-rule-fill {
      fill: var(--pl-color-line);
    }
    .g-rule-strong {
      stroke: var(--pl-color-line-strong);
    }
    .g-margin {
      stroke: var(--pl-color-margin);
    }
    .g-mark {
      stroke: var(--pl-color-danger);
    }
    .g-ink {
      stroke: var(--pl-color-muted);
    }
    .g-ink-fill {
      fill: var(--pl-color-muted);
    }
    .g-warm {
      fill: var(--pl-color-joy-2);
    }
    .g-warm-stroke {
      stroke: var(--pl-color-joy-2);
    }
    .g-eraser {
      fill: var(--pl-course-raspberry-tint);
    }
  `,
})
export class Glyph {
  readonly name = input.required<GlyphName>()
  readonly size = input<GlyphSize>(1)
  readonly label = input<string>()
}
