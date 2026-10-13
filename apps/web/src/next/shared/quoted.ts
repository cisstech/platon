import { NO_BREAK_SPACE } from '@platon/design-system'

/** « algo », between French quotes that never leave it alone at the end of a line. */
export const quoted = (text: string): string => `«${NO_BREAK_SPACE}${text}${NO_BREAK_SPACE}»`
