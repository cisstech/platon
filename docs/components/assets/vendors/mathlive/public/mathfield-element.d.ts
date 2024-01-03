/* 0.89.4 */import { Selector } from './commands';
import { LatexSyntaxError, ParseMode, Style } from './core';
import { Mathfield, InsertOptions, OutputFormat, Offset, Range, Selection } from './mathfield';
import { MathfieldOptions } from './options';
export declare type Expression = number | string | {
    [key: string]: any;
} | [Expression, ...Expression[]];
/**
 * The `focus-out` event signals that the mathfield has lost focus through keyboard
 * navigation with the **tab** key.
 *
 * The event `detail.direction` property indicates if **tab**
 * (`direction === "forward"`) or **shift+tab** (`direction === "backward") was
 * pressed which can be useful to decide which element to focus next.
 *
 * If the event is canceled by calling `ev.preventDefault()`, no change of
 * focus will occur (but you can manually change the focus in your event
 * handler: this gives you an opportunity to override the default behavior
 * and selects which element should get the focus, or to prevent from a change
 * of focus altogether).
 *
 * If the event is not canceled, the default behavior will take place, which is
 * to change the focus to the next/previous focusable element.
 *
 * ```javascript
 * mfe.addEventListener('focus-out', (ev) => {
 *  console.log("Losing focus ", ev.detail.direction);
 * });
 * ```
 */
export type FocusOutEvent = {
    direction: 'forward' | 'backward';
};
/**
 * The `move-out` event signals that the user pressed an **arrow** key but
 * there was no navigation possible inside the mathfield.
 *
 * This event provides an opportunity to handle this situation, for example
 * by focusing an element adjacent to the mathfield.
 *
 * If the event is canceled (i.e. `evt.preventDefault()` is called inside your
 * event handler), the default behavior is to play a "plonk" sound.
 *
 */
export type MoveOutEvent = {
    direction: 'forward' | 'backward' | 'upward' | 'downward';
};
/**  The `placeholder-change` event signals that an editable placeholder inside
 * a read-only mathfield has been modified. The `placeholderId` property
 * indicates which placeholder was changed.
 */
export type PlaceholderChange = {
    placeholderId: string;
};
/**
 * See documentation for the `virtual-keyboard-mode` option.
 */
export type VirtualKeyboardMode = 'auto' | 'manual' | 'onfocus' | 'off';
declare global {
    /**
     * Map the custom event names to types
     * @internal
     */
    interface HTMLElementEventMap {
        'focus-out': CustomEvent<FocusOutEvent>;
        'mode-change': Event;
        'mount': Event;
        'move-out': CustomEvent<MoveOutEvent>;
        'placeholder-change': CustomEvent<PlaceholderChange>;
        'unmount': Event;
        'read-aloud-status-change': Event;
        'selection-change': Event;
        'undo-state-change': Event;
        'before-virtual-keyboard-toggle': Event;
        'virtual-keyboard-toggle': Event;
    }
}
/**
 * These attributes of the `<math-field>` element correspond to the
 * [MathfieldOptions] properties.
 */
export interface MathfieldElementAttributes {
    [key: string]: unknown;
    'default-mode': string;
    'fonts-directory': string;
    /**
     * Scaling factor to be applied to horizontal spacing between elements of
     * the formula. A value greater than 1.0 can be used to improve the
     * legibility.
     *
     * @deprecated Use registers `\thinmuskip`, `\medmuskip` and `\thickmuskip`
     *
     */
    'horizontal-spacing-scale': string;
    /**
     * Maximum time, in milliseconds, between consecutive characters for them to be
     * considered part of the same shortcut sequence.
     *
     * A value of 0 is the same as infinity: any consecutive character will be
     * candidate for an inline shortcut, regardless of the interval between this
     * character and the previous one.
     *
     * A value of 750 will indicate that the maximum interval between two
     * characters to be considered part of the same inline shortcut sequence is
     * 3/4 of a second.
     *
     * This is useful to enter "+-" as a sequence of two characters, while also
     * supporting the "±" shortcut with the same sequence.
     *
     * The first result can be entered by pausing slightly between the first and
     * second character if this option is set to a value of 250 or so.
     *
     * Note that some operations, such as clicking to change the selection, or
     * losing the focus on the mathfield, will automatically timeout the
     * shortcuts.
     */
    'inline-shortcut-timeout': string;
    'keypress-vibration': string;
    /**
     * When a key on the virtual keyboard is pressed, produce a short audio
     * feedback.
     *
     * The value of the properties should a string, the name of an audio file in
     * the `soundsDirectory` directory or 'none' to suppress the sound.
     */
    'keypress-sound': string;
    /**
     * Sound played to provide feedback when a command has no effect, for example
     * when pressing the spacebar at the root level.
     *
     * The property is either:
     * - a string, the name of an audio file in the `soundsDirectory` directory
     * - 'none' to turn off the sound
     */
    'plonk-sound': string;
    'letter-shape-style': string;
    /**
     * The locale (language + region) to use for string localization.
     *
     * If none is provided, the locale of the browser is used.
     *
     */
    'locale': string;
    /** When true, the user cannot edit the mathfield. */
    'read-only': boolean;
    'remove-extraneous-parentheses': boolean;
    /**
     * When `on` and an open fence is entered via `typedText()` it will
     * generate a contextually appropriate markup, for example using
     * `\left...\right` if applicable.
     *
     * When `off`, the literal value of the character will be inserted instead.
     */
    'smart-fence': string;
    /**
     * When `on`, during text input the field will switch automatically between
     * 'math' and 'text' mode depending on what is typed and the context of the
     * formula. If necessary, what was previously typed will be 'fixed' to
     * account for the new info.
     *
     * For example, when typing "if x >0":
     *
     * | Type  | Interpretation |
     * |---:|:---|
     * | "i" | math mode, imaginary unit |
     * | "if" | text mode, english word "if" |
     * | "if x" | all in text mode, maybe the next word is xylophone? |
     * | "if x >" | "if" stays in text mode, but now "x >" is in math mode |
     * | "if x > 0" | "if" in text mode, "x > 0" in math mode |
     *
     * Smart Mode is `off` by default.
     *
     * Manually switching mode (by typing `alt/option+=`) will temporarily turn
     * off smart mode.
     *
     *
     * **Examples**
     *
     * -   slope = rise/run
     * -   If x > 0, then f(x) = sin(x)
     * -   x^2 + sin (x) when x > 0
     * -   When x<0, x^{2n+1}<0
     * -   Graph x^2 -x+3 =0 for 0<=x<=5
     * -   Divide by x-3 and then add x^2-1 to both sides
     * -   Given g(x) = 4x – 3, when does g(x)=0?
     * -   Let D be the set {(x,y)|0<=x<=1 and 0<=y<=x}
     * -   \int\_{the unit square} f(x,y) dx dy
     * -   For all n in NN
     *
     */
    'smart-mode': string;
    /**
     * When `on`, when a digit is entered in an empty superscript, the cursor
     * leaps automatically out of the superscript. This makes entry of common
     * polynomials easier and faster. If entering other characters (for example
     * "n+1") the navigation out of the superscript must be done manually (by
     * using the cursor keys or the spacebar to leap to the next insertion
     * point).
     *
     * When `off`, the navigation out of the superscript must always be done
     * manually.
     *
     */
    'smart-superscript': string;
    'speech-engine': string;
    'speech-engine-rate': string;
    'speech-engine-voice': string;
    'text-to-speech-markup': string;
    'text-to-speech-rules': string;
    'virtual-keyboard-layout': string;
    /**
     * -   `"manual"`: pressing the virtual keyboard toggle button will show or hide
     *     the virtual keyboard. If hidden, the virtual keyboard is not shown when
     *     the field is focused until the toggle button is pressed.
     * -   `"onfocus"`: the virtual keyboard will be displayed whenever the field is
     *     focused and hidden when the field loses focus. In that case, the virtual
     *     keyboard toggle button is not displayed.
     * -   `"off"`: the virtual keyboard toggle button is not displayed, and the
     *     virtual keyboard is never triggered.
     *
     * If the setting is `"auto"`, it will default to `"onfocus"` on touch-capable
     * devices and to `"off"` otherwise.
     *
     */
    'virtual-keyboard-mode': VirtualKeyboardMode;
    /**
     * The visual theme used for the virtual keyboard.
     *
     * If empty, the theme will switch automatically based on the device it's
     * running on. The two supported themes are 'material' and 'apple' (the
     * default).
     */
    'virtual-keyboard-theme': string;
    /**
     * A space separated list of the keyboards that should be available. The
     * keyboard `"all"` is synonym with `"numeric"`, `"functions"``, `"symbols"``
     * `"roman"` and `"greek"`,
     *
     * The keyboards will be displayed in the order indicated.
     */
    'virtual-keyboards': 'all' | 'numeric' | 'roman' | 'greek' | 'functions' | 'symbols' | 'latex' | string;
    /**
     * When `true`, use a shared virtual keyboard for all the mathfield
     * elements in the page, even across _iframes_.
     *
     * When setting this option to true, you must create the shared
     * virtual keyboard in the the parent document:
     *
     * ```javascript
     * import { makeSharedVirtualKeyboard } from 'mathlive';
     *
     *     makeSharedVirtualKeyboard({
     *         virtualKeyboardToolbar: 'none',
     *     });
     * ```
     * You should call `makeSharedVirtualKeyboard()` as early as possible.
     * `makeSharedVirtualKeyboard()` only applies to mathfield instances created
     *  after it is called.
     *
     *
     * **Default**: `false`
     */
    'use-shared-virtual-keyboard': boolean;
    /**
     * Specify the `targetOrigin` parameter for
     * [postMessage](https://developer.mozilla.org/en/docs/Web/API/Window/postMessage)
     * to send control messages from child to parent frame to remote control
     * of mathfield component.
     *
     * **Default**: `globalThis.origin`
     */
    'shared-virtual-keyboard-target-origin': string;
    /**
     * The LaTeX string to insert when the spacebar is pressed (on the physical or
     * virtual keyboard). Empty by default. Use `\;` for a thick space, `\:` for
     * a medium space, `\,` for a thin space.
     */
    'math-mode-space': string;
}
/**
 * The `MathfieldElement` class provides special properties and
 * methods to control the display and behavior of `<math-field>`
 * elements.
 *
 * It inherits many useful properties and methods from [[`HTMLElement`]] such
 * as `style`, `tabIndex`, `addEventListener()`, `getAttribute()`,  etc...
 *
 * To create a new `MathfieldElement`:
 *
 * ```javascript
 * // 1. Create a new MathfieldElement
 * const mfe = new MathfieldElement();
 * // 2. Attach it to the DOM
 * document.body.appendChild(mfe);
 * ```
 *
 * The `MathfieldElement` constructor has an optional argument of
 * [[`MathfieldOptions`]] to configure the element. The options can also
 * be modified later:
 *
 * ```javascript
 * // Setting options during construction
 * const mfe = new MathfieldElement({ smartFence: false });
 * // Modifying options after construction
 * mfe.setOptions({ smartFence: true });
 * ```
 *
 * ### CSS Variables
 *
 * To customize the appearance of the mathfield, declare the following CSS
 * variables (custom properties) in a ruleset that applies to the mathfield.
 *
 * ```css
 * math-field {
 *  --hue: 10       // Set the highlight color and caret to a reddish hue
 * }
 * ```
 *
 * Alternatively you can set these CSS variables programatically:
 *
 * ```js
 *   document.body.style.setProperty("--hue", "10");
 * ```
 * <div class='symbols-table' style='--first-col-width:25ex'>
 *
 * | CSS Variable | Usage |
 * |:---|:---|
 * | `--hue` | Hue of the highlight color and the caret |
 * | `--contains-highlight-background-color` | Backround property for items that contain the caret |
 * | `--primary-color` | Primary accent color, used for example in the virtual keyboard |
 * | `--text-font-family` | The font stack used in text mode |
 * | `--smart-fence-opacity` | Opacity of a smart fence (default is 50%) |
 * | `--smart-fence-color` | Color of a smart fence (default is current color) |
 *
 * </div>
 *
 * You can customize the appearance and zindex of the virtual keyboard panel
 * with some CSS variables associated with a selector that applies to the
 * virtual keyboard panel container.
 *
 * Read more about [customizing the virtual keyboard appearance](https://cortexjs.io/mathlive/guides/virtual-keyboards/#custom-appearance)
 *
 * ### CSS Parts
 *
 * To style the virtual keyboard toggle, use the `virtual-keyboard-toggle` CSS
 * part. To use it, define a CSS rule with a `::part()` selector
 * for example:
 * ```css
 * math-field::part(virtual-keyboard-toggle) {
 *  color: red;
 * }
 * ```
 *
 *
 * ### Attributes
 *
 * An attribute is a key-value pair set as part of the tag:
 *
 * ```html
 * <math-field locale="fr"></math-field>
 * ```
 *
 * The supported attributes are listed in the table below with their
 * corresponding property.
 *
 * The property can be changed either directly on the
 * `MathfieldElement` object, or using `setOptions()` if it is prefixed with
 * `options.`, for example:
 *
 * ```javascript
 *  getElementById('mf').value = '\\sin x';
 *  getElementById('mf').setOptions({horizontalSpacingScale: 1.1});
 * ```
 *
 * The values of attributes and properties are reflected, which means you can change one or the
 * other, for example:
 *
 * ```javascript
 * getElementById('mf').setAttribute('virtual-keyboard-mode',  'manual');
 * console.log(getElementById('mf').getOption('virtualKeyboardMode'));
 * // Result: "manual"
 * getElementById('mf').setOptions({virtualKeyboardMode: 'onfocus');
 * console.log(getElementById('mf').getAttribute('virtual-keyboard-mode');
 * // Result: 'onfocus'
 * ```
 *
 * An exception is the `value` property, which is not reflected on the `value`
 * attribute: the `value` attribute remains at its initial value.
 *
 *
 * <div class='symbols-table' style='--first-col-width:32ex'>
 *
 * | Attribute | Property |
 * |:---|:---|
 * | `disabled` | `disabled` |
 * | `default-mode` | `options.defaultMode` |
 * | `fonts-directory` | `options.fontsDirectory` |
 * | `sounds-directory` | `options.soundsDirectory` |
 * | `horizontal-spacing-scale` | `options.horizontalSpacingScale` |
 * | `inline-shortcut-timeout` | `options.inlineShortcutTimeout` |
 * | `keypress-vibration` | `options.keypressVibration` |
 * | `keypress-sound` | `options.keypressSound` |
 * | `plonk-sound` | `options.plonkSound` |
 * | `letter-shape-style` | `options.letterShapeStyle` |
 * | `locale` | `options.locale` |
 * | `math-mode-space` | `options.mathModeSpace` |
 * | `read-only` | `options.readOnly` |
 * | `remove-extraneous-parentheses` | `options.removeExtraneousParentheses` |
 * | `smart-fence` | `options.smartFence` |
 * | `smart-mode` | `options.smartMode` |
 * | `smart-superscript` | `options.superscript` |
 * | `speech-engine` | `options.speechEngine` |
 * | `speech-engine-rate` | `options.speechEngineRate` |
 * | `speech-engine-voice` | `options.speechEngineVoice` |
 * | `text-to-speech-markup` | `options.textToSpeechMarkup` |
 * | `text-to-speech-rules` | `options.textToSpeechRules` |
 * | `value` | `value` |
 * | `virtual-keyboard-layout` | `options.virtualKeyboardLayout` |
 * | `virtual-keyboard-mode` | `options.virtualKeyboardMode` |
 * | `virtual-keyboard-theme` | `options.virtualKeyboardTheme` |
 * | `virtual-keyboards` | `options.virtualKeyboards` |
 *
 * </div>
 *
 * See [[`MathfieldOptions`]] for more details about these options.
 *
 * In addition, the following [global attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes)
 * can also be used:
 * - `class`
 * - `data-*`
 * - `hidden`
 * - `id`
 * - `item*`
 * - `style`
 * - `tabindex`
 *
 *
 * ### Events
 *
 * Listen to these events by using `addEventListener()`. For events with additional
 * arguments, the arguments are available in `event.detail`.
 *
 * <div class='symbols-table' style='--first-col-width:27ex'>
 *
 * | Event Name  | Description |
 * |:---|:---|
 * | `input` | The value of the mathfield has been modified. This happens on almost every keystroke in the mathfield.  |
 * | `change` | The user has committed the value of the mathfield. This happens when the user presses **Return** or leaves the mathfield. |
 * | `selection-change` | The selection (or caret position) in the mathfield has changed |
 * | `mode-change` | The mode (`math`, `text`) of the mathfield has changed |
 * | `undo-state-change` |  The state of the undo stack has changed |
 * | `read-aloud-status-change` | The status of a read aloud operation has changed |
 * | `before-virtual-keyboard-toggle` | The visibility of the virtual keyboard panel is about to change.  |
 * | `virtual-keyboard-toggle` | The visibility of the virtual keyboard panel has changed. When using `makeSharedVirtualKeyboard()`, listen for this even on the object returned by `makeSharedVirtualKeyboard()` |
 * | `blur` | The mathfield is losing focus |
 * | `focus` | The mathfield is gaining focus |
 * | `focus-out` | The user is navigating out of the mathfield, typically using the **tab** key<br> `detail: {direction: 'forward' | 'backward' | 'upward' | 'downward'}` **cancellable**|
 * | `move-out` | The user has pressed an **arrow** key, but there is nowhere to go. This is an opportunity to change the focus to another element if desired. <br> `detail: {direction: 'forward' | 'backward' | 'upward' | 'downward'}` **cancellable**|
 * | `math-error` | A parsing or configuration error happened <br> `detail: ErrorListener<ParserErrorCode | MathfieldErrorCode>` |
 * | `keystroke` | The user typed a keystroke with a physical keyboard <br> `detail: {keystroke: string, event: KeyboardEvent}` |
 * | `mount` | The element has been attached to the DOM |
 * | `unmount` | The element is about to be removed from the DOM |
 *
 * </div>
 *
 * @keywords zindex, events, attribute, attributes, property, properties, parts, variables, css, mathfield, mathfieldelement

 */
export declare class MathfieldElement extends HTMLElement implements Mathfield {
    static get formAssociated(): boolean;
    /**
     * Private lifecycle hooks
     * @internal
     */
    static get optionsAttributes(): Record<string, 'number' | 'boolean' | 'string' | 'on/off'>;
    /**
     * Custom elements lifecycle hooks
     * @internal
     */
    static get observedAttributes(): string[];
    /** @internal */
    private _mathfield;
    /** @internal */
    private _slotValue;
    /** @internal */
    private _internals;
    /** @internal */
    private _style;
    /**
       * To create programmatically a new mathfield use:
       *
       ```javascript
      let mfe = new MathfieldElement();
  
      // Set initial value and options
      mfe.value = "\\frac{\\sin(x)}{\\cos(x)}";
  
      // Options can be set either as an attribute (for simple options)...
      mfe.setAttribute('virtual-keyboard-layout', 'dvorak');
  
      // ... or using `setOptions()`
      mfe.setOptions({
          virtualKeyboardMode: 'manual',
      });
  
      // Attach the element to the DOM
      document.body.appendChild(mfe);
      ```
      */
    constructor(options?: Partial<MathfieldOptions>);
    onPointerDown(): void;
    getPlaceholderField(placeholderId: string): Mathfield | undefined;
    addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: MathfieldElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: MathfieldElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    get form(): HTMLFormElement | null;
    get name(): string;
    get type(): string;
    get mode(): ParseMode;
    set mode(value: ParseMode);
    /**
     * If the Compute Engine library is available, return the
     * compute engine associated with this mathfield.
     *
     * To load the Compute Engine library, use:
     * ```js
  import 'https://unpkg.com/@cortex-js/compute-engine?module';
  ```
     *
     */
    get computeEngine(): any;
    set computeEngine(val: any | null);
    /**
     * If the Compute Engine library is available, return a boxed MathJSON expression representing the value of the mathfield.
     *
     * To load the Compute Engine library, use:
     * ```js
  import 'https://unpkg.com/@cortex-js/compute-engine?module';
  ```
     *
     */
    get expression(): any | null;
    set expression(mathJson: Expression | any);
    get errors(): LatexSyntaxError[];
    get placeholders(): {
        [id: string]: MathfieldElement;
    };
    /**
     *  @category Options
     */
    getOptions<K extends keyof MathfieldOptions>(keys: K[]): Pick<MathfieldOptions, K>;
    getOptions(): MathfieldOptions;
    /**
     *  @category Options
     */
    getOption<K extends keyof MathfieldOptions>(key: K): MathfieldOptions[K];
    /**
     *  @category Options
     */
    setOptions(options: Partial<MathfieldOptions>): void;
    /**
     * @inheritdoc Mathfield.executeCommand
     */
    executeCommand(command: Selector | [Selector, ...any[]]): boolean;
    /**
     * @inheritdoc Mathfield.getValue
     * @category Accessing and changing the content
     */
    getValue(format?: OutputFormat): string;
    getValue(start: Offset, end: Offset, format?: OutputFormat): string;
    getValue(range: Range, format?: OutputFormat): string;
    getValue(selection: Selection, format?: OutputFormat): string;
    /**
     * @inheritdoc Mathfield.setValue
     * @category Accessing and changing the content
     */
    setValue(value?: string, options?: InsertOptions): void;
    /**
     * @inheritdoc Mathfield.hasFocus
     *
     * @category Focus
     *
     */
    hasFocus(): boolean;
    get virtualKeyboardState(): 'hidden' | 'visible';
    set virtualKeyboardState(value: 'hidden' | 'visible');
    /**
     * Sets the focus to the mathfield (will respond to keyboard input).
     *
     * @category Focus
     *
     */
    focus(): void;
    /**
     * Remove the focus from the mathfield (will no longer respond to keyboard
     * input).
     *
     * @category Focus
     *
     */
    blur(): void;
    /**
     * Select the content of the mathfield.
     * @category Selection
     */
    select(): void;
    /**
     * @inheritdoc Mathfield.insert
  
     *  @category Accessing and changing the content
     */
    insert(s: string, options?: InsertOptions): boolean;
    /**
     * @inheritdoc Mathfield.applyStyle
     *
     * @category Accessing and changing the content
     */
    applyStyle(style: Style, options?: Range | {
        range?: Range;
        operation?: 'set' | 'toggle';
    }): void;
    /**
     * The bottom location of the caret (insertion point) in viewport
     * coordinates.
     *
     * @category Selection
     */
    get caretPoint(): null | {
        x: number;
        y: number;
    };
    set caretPoint(point: null | {
        x: number;
        y: number;
    });
    /**
     * `x` and `y` are in viewport coordinates.
     *
     * Return true if the location of the point is a valid caret location.
     *
     * See also [[`caretPoint`]]
     * @category Selection
     */
    setCaretPoint(x: number, y: number): boolean;
    /** The offset closest to the location `(x, y)` in viewport coordinate.
     *
     * **`bias`**:  if `0`, the vertical midline is considered to the left or
     * right sibling. If `-1`, the left sibling is favored, if `+1`, the right
     * sibling is favored.
     *
     * @category Selection
     */
    offsetFromPoint(x: number, y: number, options?: {
        bias?: -1 | 0 | 1;
    }): Offset;
    /** The bounding rect of the atom at offset
     *
     * @category Selection
     *
     */
    hitboxFromOffset(offset: number): DOMRect | null;
    /**
     * Reset the undo stack
     * (for parent components with their own undo/redo)
     */
    resetUndo(): void;
    /**
     * Return whether there are undoable items
     * (for parent components with their own undo/redo)
     */
    canUndo(): boolean;
    /**
     * Return whether there are redoable items
     * (for parent components with their own undo/redo)
     */
    canRedo(): boolean;
    /**
     * Custom elements lifecycle hooks
     * @internal
     */
    connectedCallback(): void;
    /**
     * Custom elements lifecycle hooks
     * @internal
     */
    disconnectedCallback(): void;
    /**
     * Private lifecycle hooks
     * @internal
     */
    upgradeProperty(prop: string): void;
    /**
     * Custom elements lifecycle hooks
     * @internal
     */
    attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void;
    get readonly(): boolean;
    set readonly(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    /**
     * The content of the mathfield as a LaTeX expression.
     * ```js
     * document.querySelector('mf').value = '\\frac{1}{\\pi}'
     * ```
     *  @category Accessing and changing the content
     */
    get value(): string;
    /**
     *  @category Accessing and changing the content
     */
    set value(value: string);
    get defaultMode(): 'inline-math' | 'math' | 'text';
    set defaultMode(value: 'inline-math' | 'math' | 'text');
    get fontsDirectory(): string | null;
    set fontsDirectory(value: string | null);
    get mathModeSpace(): string;
    set mathModeSpace(value: string);
    get inlineShortcutTimeout(): number;
    set inlineShortcutTimeout(value: number);
    get keypressVibration(): boolean;
    set keypressVibration(value: boolean);
    get keypressSound(): string | null | {
        spacebar?: null | string;
        return?: null | string;
        delete?: null | string;
        default: null | string;
    };
    set keypressSound(value: string | null | {
        spacebar?: null | string;
        return?: null | string;
        delete?: null | string;
        default: null | string;
    });
    get plonkSound(): string | null;
    set plonkSound(value: string | null);
    get letterShapeStyle(): 'auto' | 'tex' | 'iso' | 'french' | 'upright';
    set letterShapeStyle(value: 'auto' | 'tex' | 'iso' | 'french' | 'upright');
    get locale(): string;
    set locale(value: string);
    get readOnly(): boolean;
    set readOnly(value: boolean);
    get removeExtraneousParentheses(): boolean;
    set removeExtraneousParentheses(value: boolean);
    get smartFence(): boolean;
    set smartFence(value: boolean);
    get smartMode(): boolean;
    set smartMode(value: boolean);
    get smartSuperscript(): boolean;
    set smartSuperscript(value: boolean);
    get speechEngine(): 'local' | 'amazon';
    set speechEngine(value: 'local' | 'amazon');
    get speechEngineRate(): string;
    set speechEngineRate(value: string);
    get speechEngineVoice(): string;
    set speechEngineVoice(value: string);
    get textToSpeechMarkup(): '' | 'ssml' | 'ssml_step' | 'mac';
    set textToSpeechMarkup(value: '' | 'ssml' | 'ssml_step' | 'mac');
    get textToSpeechRules(): 'mathlive' | 'sre';
    set textToSpeechRule(value: 'mathlive' | 'sre');
    get virtualKeyboardLayout(): 'auto' | 'qwerty' | 'azerty' | 'qwertz' | 'dvorak' | 'colemak';
    set virtualKeyboardLayout(value: 'auto' | 'qwerty' | 'azerty' | 'qwertz' | 'dvorak' | 'colemak');
    get virtualKeyboardMode(): VirtualKeyboardMode;
    set virtualKeyboardMode(value: VirtualKeyboardMode);
    get virtualKeyboardTheme(): 'material' | 'apple' | '';
    set virtualKeyboardTheme(value: 'material' | 'apple' | '');
    get virtualKeyboards(): string;
    set virtualKeyboards(value: string);
    get useSharedVirtualKeyboard(): boolean;
    set useSharedVirtualKeyboard(value: boolean);
    get sharedVirtualKeyboardTargetOrigin(): string;
    set sharedVirtualKeyboardTargetOrigin(value: string);
    /**
     * An array of ranges representing the selection.
     *
     * It is guaranteed there will be at least one element. If a discontinuous
     * selection is present, the result will include more than one element.
     *
     * @category Selection
     *
     */
    get selection(): Selection;
    /**
     *
     * @category Selection
     */
    set selection(sel: Selection | Offset);
    get selectionIsCollapsed(): boolean;
    /**
     * The position of the caret/insertion point, from 0 to `lastOffset`.
     *
     * @category Selection
     *
     */
    get position(): Offset;
    /**
     * @category Selection
     */
    set position(offset: Offset);
    /**
     * The depth of an offset represent the depth in the expression tree.
     */
    getOffsetDepth(offset: Offset): number;
    /**
     * The last valid offset.
     * @category Selection
     */
    get lastOffset(): Offset;
}
export default MathfieldElement;
declare global {
    /** @internal */
    interface Window {
        MathfieldElement: typeof MathfieldElement;
    }
}
