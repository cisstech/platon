const CONJUNCTION = new Intl.ListFormat('fr-FR', { type: 'conjunction' })

/** « Julien Lefèvre », « Julien Lefèvre et Léa Fontaine », « A, B et C ». */
export const listOf = (items: readonly string[]): string => CONJUNCTION.format(items)
