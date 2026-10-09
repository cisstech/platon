/** The eight course colors: a course keeps its hue everywhere. */
export const COURSE_HUES = ['coral', 'amber', 'olive', 'mint', 'lagoon', 'cornflower', 'lilac', 'raspberry'] as const
export type CourseHue = (typeof COURSE_HUES)[number]

/**
 * The hue of a course, derived from a stable key such as its id: the same on every screen and every
 * load, spread over the eight hues.
 */
export const courseHue = (key: string): CourseHue => {
  // FNV-1a, 32 bits: stable across browsers and fast on short strings.
  let hash = 0x811c9dc5
  for (let index = 0; index < key.length; index++) {
    hash ^= key.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return COURSE_HUES[hash % COURSE_HUES.length]
}
