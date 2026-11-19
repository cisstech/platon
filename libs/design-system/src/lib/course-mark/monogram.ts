/** Words that do not make a monogram. */
const MINOR_WORDS = new Set([
  'a',
  'au',
  'aux',
  'avec',
  'd',
  'dans',
  'de',
  'des',
  'du',
  'en',
  'et',
  'l',
  'la',
  'le',
  'les',
  'par',
  'pour',
  'sur',
  'un',
  'une',
])

/**
 * The monogram of a course, from its name: the initials of the words that count, or the first two
 * letters of a single word, then the number that ends the name. « Algorithmique et programmation 1 »
 * gives AP1, « Analyse 1 » AN1, « Programmation web » PW.
 */
export const monogram = (name: string): string => {
  const plain = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
  const tokens = plain.split(/[^A-Z0-9]+/).filter(Boolean)
  const last = tokens[tokens.length - 1] ?? ''
  const number = /\d/.test(last) ? last.replace(/\D/g, '') : ''
  const words = (number ? tokens.slice(0, -1) : tokens).filter(
    (token) => /[A-Z]/.test(token) && !MINOR_WORDS.has(token.toLowerCase())
  )
  const letters =
    words.length === 1
      ? words[0].slice(0, 2)
      : words
          .map((word) => word[0])
          .join('')
          .slice(0, 3)
  return letters + number
}
