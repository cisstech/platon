import { Observable } from 'rxjs'
export interface SearchBarFilterer<T> {
  run(query: string): Observable<T[]>
}

export interface SearchBar<T> {
  /**
   * Current value of the search bar.
   *
   * Notes:
   * - updating the value will call `onSearch`
   * - `onSearch` is called after ngOnInit with the initial value.
   */
  value?: string

  /** Filterer object. */
  filterer: SearchBarFilterer<T>

  /** Search bar placeholder. */
  placeholder?: string

  /** A callback function to call when the searchbar is created. */
  onReady?: () => void

  /**
   * A callback function to call when the search bar query is submitted.
   * @param query the query to run.
   */
  onSearch?: (query: string) => void

  /**
   * A callback function to call when the filter button is clicked.
   * Notes :
   * The filter button will not be displayed if this callback is not provided.
   */
  onFilter?: () => void

  /**
   * Function called when a suggestion item is selected.
   */
  onSelect?: (suggestion: T) => void

  /**
   * Function called to gets the value to add to the searchbox
   * when an item is selected inside the suggestion list
   */
  complete?(suggestion: T): string
}
