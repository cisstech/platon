/** The two interfaces: the current one and the new one. */
export type UiMode = 'legacy' | 'next'

/**
 * Rollout of the new interface for people who have not chosen one yet:
 * `off` keeps the current one, `opt-in` offers the new one, `default` starts it.
 */
export type UiFlag = 'off' | 'opt-in' | 'default'

/**
 * Value of the `?ui=` parameter. A mode is kept as the preference; `legacy-once` opens the current
 * interface for this load only, for a screen the new one does not have yet.
 */
export type UiParam = UiMode | 'legacy-once'

export const parseUiMode = (value: unknown): UiMode | null => (value === 'legacy' || value === 'next' ? value : null)

export const parseUiParam = (value: unknown): UiParam | null => (value === 'legacy-once' ? value : parseUiMode(value))

export const parseUiFlag = (value: unknown): UiFlag => (value === 'opt-in' || value === 'default' ? value : 'off')

/** The parameter wins, then the stored preference, then the flag. */
export const resolveUiMode = (input: { param: UiParam | null; stored: UiMode | null; flag: UiFlag }): UiMode => {
  if (input.param === 'legacy-once') return 'legacy'
  return input.param ?? input.stored ?? (input.flag === 'default' ? 'next' : 'legacy')
}
