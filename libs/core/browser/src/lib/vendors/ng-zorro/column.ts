import { NzTableFilterFn, NzTableFilterList, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table'

export type NzTableColumn<T> = {
  key: string
  name: string
  sortOrder?: NzTableSortOrder | null
  sortFn?: NzTableSortFn<T> | boolean | null
  listOfFilter?: NzTableFilterList | null
  filterMultiple?: boolean | null
  filterFn?: NzTableFilterFn<T> | boolean | null
}
