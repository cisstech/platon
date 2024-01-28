/* 0.89.4 *//**
 * Server-side rendering exports.
 *
 * These functions do not require a DOM environment and can
 * be used from a server-side environment.
 *
 */
import { LatexSyntaxError, ParseMode } from './core';
import { Expression } from './mathfield-element';
import { TextToSpeechOptions } from './options';
import '../core/modes';
/**
 * Convert a LaTeX string to a string of HTML markup.
 *
 * **(Note)**
 *
 * This function does not interact with the DOM. The function does not load
 * fonts or inject stylesheets in the document. It can be used
 * on the server side.
 *
 * To get the output of this function to correctly display
 * in a document, use the mathlive static style sheet by adding the following
 * to the `<head>` of the document:
 *
 * ```html
 * <link rel="stylesheet" href="https://unpkg.com/mathlive/dist/mathlive-static.css" />
 * ```
 *
 * ---
 *
 * @param text A string of valid LaTeX. It does not have to start
 * with a mode token such as `$$` or `\(`.
 *
 * @param options.mathstyle If `"displaystyle"` the "display" mode of TeX
 * is used to typeset the formula, which is most appropriate for formulas that are
 * displayed in a standalone block.
 *
 * If `"textstyle"` is used, the "text" mode
 * of TeX is used, which is most appropriate when displaying math "inline"
 * with other text (on the same line).
 *
 * @param  options.macros A dictionary of LaTeX macros
 *
 *
 * @category Converting
 * @keywords convert, latex, markup
 */
export declare function convertLatexToMarkup(text: string, options?: {
    mathstyle?: 'displaystyle' | 'textstyle';
    format?: string;
}): string;
export declare function validateLatex(s: string): LatexSyntaxError[];
/**
 * Convert a LaTeX string to a string of MathML markup.
 *
 * @param latex A string of valid LaTeX. It does not have to start
 * with a mode token such as a `$$` or `\(`.
 * @param options.generateId If true, add an `"extid"` attribute
 * to the MathML nodes with a value matching the `atomID`. This can be used
 * to map items on the screen with their MathML representation or vice-versa.
 * @param options.onError Callback invoked when an error is encountered while
 * parsing the input string.
 *
 * @category Converting
 */
export declare function convertLatexToMathMl(latex: string, options?: {
    generateID?: boolean;
}): string;
/**
 * Convert a LaTeX string to a textual representation ready to be spoken
 *
 * @param latex A string of valid LaTeX. It does not have to start
 * with a mode token such as a `$$` or `\(`.
 *
 * @param options {@inheritDoc TextToSpeechOptions}
 *
 * @return The spoken representation of the input LaTeX.
 * @example
 * console.log(convertLatexToSpeakableText('\\frac{1}{2}'));
 * // 'half'
 * @category Converting
 * @keywords convert, latex, speech, speakable, text, speakable text
 */
export declare function convertLatexToSpeakableText(latex: string, options?: Partial<TextToSpeechOptions>): string;
export declare function serializeMathJsonToLatex(json: Expression): string;
export declare function convertLatexToAsciiMath(latex: string, mode?: ParseMode): string;
export declare function convertAsciiMathToLatex(ascii: string): string;
