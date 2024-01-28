/* 0.89.4 *//**
 *
 * Use MathLive to render and edit mathematical formulas.
 *
 *
 * @example
 * <script type="module">
 * // Load the `MathLive` module from a CDN
 * import { convertLatexToSpeakableText } from 'https://unpkg.com/mathlive?module';
 *
 * console.log(convertLatexToSpeakableText('e^{i\\pi}+1=0'));
 * </script>
 *
 * @packageDocumentation MathLive SDK Reference 0.89.4
 * @version 0.89.4
 *
 */
import { VirtualKeyboardInterface } from './mathfield';
import { RemoteVirtualKeyboardOptions, AutoRenderOptions } from './options';
export * from './commands';
export * from './core';
export * from './options';
export * from './mathfield';
export * from './mathfield-element';
export * from './mathlive-ssr';
export declare function makeSharedVirtualKeyboard(options?: Partial<RemoteVirtualKeyboardOptions>): VirtualKeyboardInterface & EventTarget;
export declare function renderMathInDocument(options?: AutoRenderOptions): void;
export declare function renderMathInElement(element: string | HTMLElement, options?: AutoRenderOptions): void;
export declare const version: {
    mathlive: string;
};
