import { HttpParams } from '@angular/common/http'

export const buildHttpParams = <T extends object>(object?: T | null) => {
  if (!object) {
    return new HttpParams()
  }
  let params = new HttpParams()
  Object.keys(object).forEach((key) => {
    const value = (object as Record<string, unknown>)[key]
    if (value === undefined) {
      return
    }

    if (value === null) {
      params = params.set(key, '')
      return
    }

    if (Array.isArray(value)) {
      value.forEach((v) => {
        params = params.set(key, v)
      })
      return
    }
    params = params.set(key, value as string)
  })

  return params
}
