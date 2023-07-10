import { InjectionToken } from '@angular/core'
import { Transition } from '../automaton'

export interface AutomatonEditorActionContext {
  state?: string
  transition?: Transition
}

export interface AutomatonEditorAction {
  name: string
  run: (context: AutomatonEditorActionContext) => void | Promise<void>
  condition: (context: AutomatonEditorActionContext) => boolean
}

export const AUTOMATON_EDITOR_ACTIONS = new InjectionToken<AutomatonEditorAction[]>(
  'AUTOMATON_EDITOR_ACTIONS'
)
