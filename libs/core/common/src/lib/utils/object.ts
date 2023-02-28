/* eslint-disable @typescript-eslint/no-explicit-any */
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): Record<string, any> => {
  for (const key in source) {
    if (typeof source[key] === "object" && source[key] !== null) {
      if (!(key in target)) {
        Object.assign(target, { [key]: {} });
      }
      deepMerge(target[key] as any, source[key] as any);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}


export function deepCopy<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  const copy = obj instanceof Array ? [] : {};
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if ((obj as any).hasOwnProperty(key)) {
      (copy as any)[key] = deepCopy(obj[key]);
    }
  }
  return copy as T;
}
