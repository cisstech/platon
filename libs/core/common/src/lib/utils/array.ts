export const uniquifyBy = <T extends object>(array: T[], key: keyof T): T[] => {
  const map = new Map<unknown, T>()
  array.forEach((item) => {
    map.set(item[key], item)
  })
  return Array.from(map.values())
}

/**
 * Uniquify property value across array of objects.
 * @remarks
 * - The original array is not modified.
 * - If there are multiple objects with the same property value, the duplications are suffixed with a number between parentheses.
 * @param array The array of objects to uniquify
 * @param key The property to uniquify
 * @returns The uniquified array of objects
 */
export const uniquifyProperty = <T extends object>(array: T[], key: keyof T): T[] => {
  const result: T[] = []
  const map = new Map<unknown, number>()
  array.forEach((item) => {
    const value = item[key]
    const count = map.get(value) ?? 0
    map.set(value, count + 1)
    if (count === 0) {
      result.push(item)
    } else {
      result.push({ ...item, [key]: `${value} (${count})` })
    }
  })
  return result
}

/**
 * Uniquify a plain array
 * @see uniquifyProperty
 * @see uniquifyBy
 * @param array Array of data that can be compared with '===' operator
 * @returns Uniquified array
 */
export const unquifyPlainArray = <T extends string | number>(array: T[]): T[] => {
  return array.filter((current, index, self) => self.findIndex((value) => value === current) === index)
}

/**
 * Shuffles the elements of an array in place.
 * @param arr The array to be shuffled.
 * @returns A new array with the elements shuffled.
 */
export const shuffleArray = <T>(arr: T[]) => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = newArr[i]
    newArr[i] = newArr[j]
    newArr[j] = t
  }
  return newArr
}
