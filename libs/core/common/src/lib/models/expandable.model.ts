export interface ExpandableModel<E = string, S = string> {
  expands?: E[]
  selects?: S[]
}
