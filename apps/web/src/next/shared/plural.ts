/** A French word for a count: the singular up to one (« 0 exercice », « 1 exercice »), the plural beyond. */
export const plural = (count: number, singular: string, pluralForm: string): string =>
  count > 1 ? pluralForm : singular
