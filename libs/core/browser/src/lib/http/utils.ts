import { HttpParams } from '@angular/common/http'
import { ExpandableModel } from '@platon/core/common'

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
        params = params.append(key, v)
      })
      return
    }
    params = params.set(key, value as string)
  })

  return params
}

export const buildExpandableHttpParams = <T extends ExpandableModel>(object?: T | null) => {
  let params = new HttpParams()

  if (object?.expands) {
    params = params.append('expands', object.expands.join(','))
  }

  if (object?.selects) {
    params = params.append('selects', object.selects.join(','))
  }

  return params
}
