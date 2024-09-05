/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-extra-semi */

type Obj = Record<string, any>

/**
 * Merge two objects recursively
 * @param target The object to merge into
 * @param source The object to merge from
 * @param replace Whether to replace sub-objects instead of merging them if they already exists on target (default: `false`)
 * @returns The merged object
 */
export const deepMerge = <T extends Obj>(target: T, source: any, replace = false): Obj => {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!(key in target)) {
        Object.assign(target, { [key]: Array.isArray(source[key]) ? [] : {} })
      }
      if (Array.isArray(source[key])) {
        ;(<any>target)[key] = source[key]
      } else if (!replace) {
        deepMerge(target[key] as any, source[key] as any)
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    } else {
      Object.assign(target, { [key]: source[key] })
    }
  }
  return target
}

export function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  const copy = obj instanceof Array ? [] : {}
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if ((obj as any).hasOwnProperty(key)) {
      ;(copy as any)[key] = deepCopy(obj[key])
    }
  }
  return copy as T
}
