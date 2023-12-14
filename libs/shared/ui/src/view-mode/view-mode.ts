export type ViewModes = 'cards' | 'table' | 'list'
export const viewModes = Object.freeze(['list', 'cards', 'table'] as ViewModes[])

export interface ViewMode {
  icon: string
  label: string
  value: ViewModes
}

export const viewModeIcons: Record<ViewModes, string> = {
  cards: 'appstore',
  table: 'table',
  list: 'unordered-list',
}
