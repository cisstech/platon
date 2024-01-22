/* eslint-disable @typescript-eslint/no-explicit-any */
export type PleInput<TValue = any, TOptions = Record<string, unknown>> = {
  name: string
  type: string
  description: string
  value: TValue
  options?: TOptions
}

export type PleConfigJSON = {
  inputs: PleInput[]
}
