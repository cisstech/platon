/**
 * What a screen reader reads of an element: nothing when it or an ancestor is hidden, else its text
 * without its hidden parts, spaces collapsed. For specs only.
 */
export const spoken = (element: Element | null | undefined): string | undefined => {
  if (!element || element.closest('[aria-hidden="true"]')) return undefined
  const clone = element.cloneNode(true) as Element
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove())
  return clone.textContent?.replace(/\s+/g, ' ').trim()
}
