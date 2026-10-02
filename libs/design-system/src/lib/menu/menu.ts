import { Menu as AriaMenu, MenuItem as AriaMenuItem, MenuTrigger as AriaMenuTrigger } from '@angular/aria/menu'
import {
  OverlayRef,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay'
import { DomPortal } from '@angular/cdk/portal'
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  effect,
  inject,
  input,
} from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'
import { Placement, positionsFor } from '../overlay/placement'

/**
 * Opens the menu it points to. The keyboard, the focus and the ARIA state come from Angular Aria.
 *
 * ```html
 * <button plButton [plMenuTrigger]="create">Créer</button>
 * <pl-menu #create="ngMenu" (itemSelected)="open($event)">…</pl-menu>
 * ```
 */
@Directive({
  selector: '[plMenuTrigger]',
  hostDirectives: [{ directive: AriaMenuTrigger, inputs: ['menu: plMenuTrigger', 'disabled'] }],
})
export class MenuTrigger {}

/**
 * A menu of actions, shown under (or above) its trigger. Selecting an entry emits its value through
 * `itemSelected` and closes the menu; `Échap` closes it and gives the focus back to the trigger.
 * The menu lives in an overlay pane from the start, so opening it never moves the focused element.
 */
@Component({
  selector: 'pl-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: AriaMenu, outputs: ['itemSelected'] }],
  host: { class: 'pl-menu' },
  template: `<ng-content />`,
  styles: `
    :host {
      display: grid;
      gap: calc(var(--pl-space-1) / 2);
      min-inline-size: 240px;
      max-inline-size: 360px;
      padding: var(--pl-space-1);
      border: 1px solid var(--pl-color-line);
      border-radius: var(--pl-radius-menu);
      background: var(--pl-color-surface-raised);
      box-shadow: var(--pl-shadow-overlay);
      color: var(--pl-color-text);
      font: var(--pl-font-body);
    }
    :host([data-visible='false']) {
      display: none;
    }
    :host([data-visible='true']) {
      animation: pl-menu-in var(--pl-duration-menu) var(--pl-ease-standard);
    }
    @keyframes pl-menu-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class Menu {
  readonly placement = input<Placement>('below-start')

  private readonly aria = inject(AriaMenu)
  private readonly injector = inject(Injector)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement
  private overlayRef?: OverlayRef

  constructor() {
    afterNextRender(() => {
      this.overlayRef = createOverlayRef(this.injector, {
        scrollStrategy: createRepositionScrollStrategy(this.injector),
      })
      this.overlayRef.attach(new DomPortal(this.host))
    })
    effect(() => {
      const origin = this.aria.parent()?.element
      if (!this.aria.visible() || !origin) return
      const placement = this.placement()
      afterNextRender(
        () => {
          this.overlayRef?.updatePositionStrategy(
            createFlexibleConnectedPositionStrategy(this.injector, origin).withPositions(positionsFor(placement))
          )
        },
        { injector: this.injector }
      )
    })
    inject(DestroyRef).onDestroy(() => this.overlayRef?.dispose())
  }
}

let lastItemId = 0

/** An entry of a menu: an icon, a title and, when it helps, a line of description. */
@Component({
  selector: 'pl-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  hostDirectives: [{ directive: AriaMenuItem, inputs: ['value', 'disabled'] }],
  host: {
    class: 'pl-menu-item',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.aria-describedby]': 'description() ? descriptionId : null',
  },
  template: `
    @if (icon(); as icon) {
    <pl-icon class="pl-menu-item__icon" [name]="icon" [size]="3" />
    }
    <span class="pl-menu-item__body">
      <span class="pl-menu-item__title" [id]="titleId"><ng-content /></span>
      @if (description()) {
      <span class="pl-menu-item__description" [id]="descriptionId">{{ description() }}</span>
      }
    </span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: var(--pl-space-3);
      padding: var(--pl-space-2) var(--pl-space-3);
      border-radius: var(--pl-radius-control);
      cursor: pointer;
      outline: none;
    }
    :host(:hover),
    :host([data-active='true']) {
      background: var(--pl-color-hover);
    }
    :host(:focus-visible) {
      outline: 2px solid var(--pl-color-focus);
      outline-offset: -2px;
    }
    :host([aria-disabled='true']) {
      color: var(--pl-color-subtle);
      cursor: not-allowed;
    }
    .pl-menu-item__icon {
      margin-block-start: 1px;
      color: var(--pl-color-muted);
    }
    .pl-menu-item__body {
      display: grid;
      gap: calc(var(--pl-space-1) / 2);
    }
    .pl-menu-item__title {
      font-weight: var(--pl-weight-strong);
    }
    .pl-menu-item__description {
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
    }
  `,
})
export class MenuItem {
  readonly icon = input<IconName>()
  /** Read after the title, as the entry's description. */
  readonly description = input<string>()

  private readonly id = ++lastItemId
  protected readonly titleId = `pl-menu-item-title-${this.id}`
  protected readonly descriptionId = `pl-menu-item-description-${this.id}`
}

/** A line between two groups of entries. */
@Component({
  selector: 'pl-menu-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'separator' },
  template: '',
  styles: `
    :host {
      display: block;
      block-size: 1px;
      margin: var(--pl-space-1) 0;
      background: var(--pl-color-line);
    }
  `,
})
export class MenuSeparator {}

/** A block of text at the head of a menu, such as the name and address in the profile menu. */
@Component({
  selector: 'pl-menu-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      padding: var(--pl-space-2) var(--pl-space-3);
    }
  `,
})
export class MenuHeader {}
