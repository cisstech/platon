/** The space French typography puts inside « 23 h 59 » or « 71 % »: it never breaks a line. */
export const NO_BREAK_SPACE = '\u00a0'

/** A text that starts a sentence: its first letter upper case, by the rules of `locale`. */
export const capitalize = (text: string, locale: string): string =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1)
