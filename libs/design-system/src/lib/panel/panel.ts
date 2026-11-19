import { ChangeDetectionStrategy, Component, ElementRef, input, output, viewChild } from '@angular/core'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'

/**
 * `popover`: a box beside what opened it, closed by a cross.
 * `screen`: the whole screen of a phone, under a bar in the colors of the cover, closed by a back arrow.
 */
export type PanelLayout = 'popover' | 'screen'

let lastId = 0

/**
 * A panel opened over the page with the Angular CDK `Dialog` (focus trap, Escape, focus return), and
 * labelled by its title through `headingId`. Actions on its whole content go in `plPanelActions`, in
 * the head; on a phone, those within reach of the thumb go in `plPanelTools`, under the bar.
 */
@Component({
  selector: 'pl-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon],
  host: { '[attr.data-layout]': 'layout()' },
  template: `
    <div class="pl-panel__head">
      @if (layout() === 'screen') {
      <button
        type="button"
        plButton
        variant="cover-icon"
        size="lg"
        #close
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <pl-icon name="arrow_back" />
      </button>
      }
      <h2 class="pl-panel__title" [id]="headingId()">{{ heading() }}</h2>
      <div class="pl-panel__actions"><ng-content select="[plPanelActions]" /></div>
      @if (layout() === 'popover') {
      <button
        type="button"
        plButton
        variant="icon"
        size="sm"
        #close
        [attr.aria-label]="closeLabel()"
        (click)="closed.emit()"
      >
        <pl-icon name="close" />
      </button>
      }
    </div>
    <div class="pl-panel__tools"><ng-content select="[plPanelTools]" /></div>
    <div class="pl-panel__body"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--pl-color-surface-raised);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    :host([data-layout='popover']) {
      inline-size: min(380px, calc(100vw - 2 * var(--pl-space-4)));
      max-block-size: min(560px, calc(100dvh - 2 * var(--pl-space-4)));
      border: 1px solid var(--pl-color-line);
      border-radius: var(--pl-radius-card);
      box-shadow: var(--pl-shadow-overlay);
    }
    :host([data-layout='screen']) {
      inline-size: 100%;
      block-size: 100dvh;
      background: var(--pl-color-surface);
    }
    .pl-panel__head {
      display: flex;
      flex: none;
      align-items: center;
      gap: var(--pl-space-2);
    }
    :host([data-layout='popover']) .pl-panel__head {
      padding: var(--pl-space-3) var(--pl-space-4);
      border-block-end: 1px solid var(--pl-color-line);
    }
    :host([data-layout='screen']) .pl-panel__head {
      block-size: var(--pl-topbar-height);
      padding: 0 var(--pl-space-2);
      background: var(--pl-color-cover);
      color: var(--pl-color-cover-text);
    }
    .pl-panel__title {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      font: var(--pl-font-subheading);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .pl-panel__actions {
      display: flex;
      align-items: center;
      gap: var(--pl-space-1);
    }
    .pl-panel__actions:empty {
      display: none;
    }
    .pl-panel__tools {
      display: flex;
      flex: none;
      align-items: center;
      justify-content: space-between;
      gap: var(--pl-space-2);
      padding: var(--pl-space-2) var(--pl-space-4);
      border-block-end: 1px solid var(--pl-color-line);
    }
    .pl-panel__tools:empty {
      display: none;
    }
    .pl-panel__body {
      flex: 1;
      min-block-size: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
  `,
})
export class Panel {
  readonly heading = input.required<string>()
  /** The name of the button that closes it, such as « Fermer les notifications ». */
  readonly closeLabel = input.required<string>()
  readonly layout = input<PanelLayout>('popover')
  /** Id of the title, to pass as `ariaLabelledBy` when opening the dialog. */
  readonly headingId = input(`pl-panel-title-${++lastId}`)

  readonly closed = output<void>()

  private readonly closeButton = viewChild<string, ElementRef<HTMLButtonElement>>('close', { read: ElementRef })

  /** Gives the focus to the button that closes the panel, when what held it has gone. */
  focusClose(): void {
    this.closeButton()?.nativeElement.focus()
  }
}
