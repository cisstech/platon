import { Injectable, Provider } from '@angular/core'
import { AutomatonEditorService } from '../../automaton-editor.service'
import { AutomatonEditorAction, AutomatonEditorActionContext, AUTOMATON_EDITOR_ACTIONS } from '../action'

/**
 * Action to turn a state of an automaton to an initial state.
 */
@Injectable()
export class ActionSetInitial implements AutomatonEditorAction {
  readonly name = 'Inital'

  constructor(private readonly editor: AutomatonEditorService) {}

  run(context: AutomatonEditorActionContext) {
    if (!context.state) return
    this.editor.addInitial(context.state)
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.state && !this.editor.isInitial(context.state)
  }
}

/**
 * Provider to register `ActionSetInitial` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionSetInitialProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionSetInitial,
}
