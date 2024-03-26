/**
 * Represents the completion data for resources search bar.
 */
export interface ResourceCompletion {
  /**
   * List of resources names that can be suggested.
   */
  readonly names: string[]

  /**
   * List of topics names that can be suggested.
   */
  readonly topics: string[]

  /**
   * List of levels names that can be suggested.
   */
  readonly levels: string[]
}
