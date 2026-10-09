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
  computed,
  effect,
  inject,
  input,
} from '@angular/core'
import { Glyph, GlyphName } from '../glyph/glyph'
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
  exportAs: 'plMenuTrigger',
  hostDirectives: [{ directive: AriaMenuTrigger, inputs: ['menu: plMenuTrigger', 'disabled'] }],
})
export class MenuTrigger {
  private readonly aria = inject(AriaMenuTrigger)
  private readonly host: HTMLElement = inject(ElementRef).nativeElement

  constructor() {
    // Capture phase: these run before the handlers of Angular Aria on the same element.
    const beforeOpening = () => this.bringMenuToFront()
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return this.bringMenuToFront()
      if (this.aria.expanded()) return
      // Angular Aria swallows Escape even with its menu closed: hand it to the container, so that a
      // dialog holding the trigger still closes.
      event.stopImmediatePropagation()
      const { key, code, keyCode } = event
      this.host.parentElement?.dispatchEvent(new KeyboardEvent('keydown', { key, code, keyCode, bubbles: true }))
    }
    this.host.addEventListener('click', beforeOpening, { capture: true })
    this.host.addEventListener('keydown', onKeydown, { capture: true })
    inject(DestroyRef).onDestroy(() => {
      this.host.removeEventListener('click', beforeOpening, { capture: true })
      this.host.removeEventListener('keydown', onKeydown, { capture: true })
    })
  }

  /** Opens the menu on its first entry, as a click on the trigger does. */
  open(): void {
    this.bringMenuToFront()
    this.aria.open()
  }

  /**
   * The CDK shows its overlays in the top layer, in the order they were shown: the menu, attached at
   * start, would open under a dialog opened since. Shown again while still closed, it comes on top
   * without moving a focused element.
   */
  private bringMenuToFront(): void {
    if (this.aria.expanded()) return
    const popover = this.aria.menu()?.element.closest<HTMLElement>('[popover]')
    if (!popover?.matches(':popover-open')) return
    popover.hidePopover()
    popover.showPopover()
  }
}

/**
 * A menu of actions, shown under (or above) its trigger. Selecting an entry emits its value through
 * `itemSelected` and closes the menu; `Échap` closes it and gives the focus back to the trigger.
 * The menu lives in an overlay pane from the start, so opening it never moves the focused element.
 * Without a trigger, it stays hidden: Angular Aria would show it in place.
 */
@Component({
  selector: 'pl-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: AriaMenu, outputs: ['itemSelected'] }],
  host: { class: 'pl-menu', '[attr.data-triggered]': 'triggered()' },
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
    :host([data-visible='false']),
    :host([data-triggered='false']) {
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
  protected readonly triggered = computed(() => Boolean(this.aria.parent()))
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

export type MenuItemTone = 'default' | 'danger'

/**
 * An entry of a menu: an icon, a title and, when it helps, a line of description. One of a set of
 * exclusive choices takes `role="menuitemradio"` and `checked`, inside a `pl-menu-group`.
 */
@Component({
  selector: 'pl-menu-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Glyph, Icon],
  hostDirectives: [{ directive: AriaMenuItem, inputs: ['value', 'disabled', 'role'] }],
  host: {
    class: 'pl-menu-item',
    '[attr.data-tone]': 'tone()',
    '[attr.aria-checked]': 'checked() === undefined ? null : checked()',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.aria-describedby]': 'description() ? descriptionId : null',
  },
  template: `
    @if (glyph(); as glyph) {
    <pl-glyph [name]="glyph" />
    } @else if (icon(); as icon) {
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
    :host([data-tone='danger']) {
      color: var(--pl-color-danger-ink);
    }
    :host([data-tone='danger']) .pl-menu-item__icon {
      color: var(--pl-color-danger);
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
    :host([role='menuitemradio']) {
      flex: 1;
      justify-content: center;
      align-items: center;
      block-size: 28px;
      padding: 0 var(--pl-space-3);
      border-radius: var(--pl-radius-1);
      color: var(--pl-color-muted);
      font: var(--pl-font-small);
    }
    :host([role='menuitemradio'][aria-checked='true']) {
      background: var(--pl-color-surface);
      box-shadow: var(--pl-shadow-float);
      color: var(--pl-color-text);
    }
    :host([role='menuitemradio']:hover:not([aria-checked='true'])) {
      background: none;
      color: var(--pl-color-text);
    }
  `,
})
export class MenuItem {
  readonly icon = input<IconName>()
  /** A PLaTon glyph at 40 px instead of the icon, for a choice of object (the Create menu). */
  readonly glyph = input<GlyphName>()
  /** `danger` for an entry that destroys something (« Supprimer la section »). */
  readonly tone = input<MenuItemTone>('default')
  /** Read after the title, as the entry's description. */
  readonly description = input<string>()
  /** Whether a `menuitemradio` or `menuitemcheckbox` entry is on. */
  readonly checked = input<boolean>()

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

let lastGroupId = 0

/**
 * A set of exclusive choices in a menu, named by `label` and drawn as a segmented choice, such as
 * the theme. Its entries are `menuitemradio`: the arrows reach them like any other entry, which a
 * `radiogroup` inside a menu would not allow.
 */
@Component({
  selector: 'pl-menu-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pl-menu-group',
    role: 'group',
    '[attr.aria-labelledby]': 'labelId',
  },
  template: `
    <span class="pl-menu-group__label" [id]="labelId">{{ label() }}</span>
    <span class="pl-menu-group__choices"><ng-content /></span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--pl-space-3);
      padding: var(--pl-space-1) var(--pl-space-3);
    }
    .pl-menu-group__label {
      color: var(--pl-color-muted);
    }
    .pl-menu-group__choices {
      display: flex;
      gap: calc(var(--pl-space-1) / 2);
      padding: calc(var(--pl-space-1) / 2);
      border-radius: var(--pl-radius-control);
      background: var(--pl-color-hover);
    }
  `,
})
export class MenuGroup {
  readonly label = input.required<string>()
  protected readonly labelId = `pl-menu-group-${++lastGroupId}`
}

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
