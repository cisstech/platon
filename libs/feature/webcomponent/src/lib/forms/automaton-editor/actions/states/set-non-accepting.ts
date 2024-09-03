import { Injectable, Provider } from '@angular/core'
import { AutomatonEditorService } from '../../automaton-editor.service'
import { AutomatonEditorAction, AutomatonEditorActionContext, AUTOMATON_EDITOR_ACTIONS } from '../action'

/**
 * Action to turn a state of an automaton to an non accepting state.
 */
@Injectable()
export class ActionSetNonAccepting implements AutomatonEditorAction {
  readonly name = 'Non final'

  constructor(private readonly editor: AutomatonEditorService) {}

  run(context: AutomatonEditorActionContext) {
    if (!context.state) {
      return
    }
    this.editor.removeAccepting(context.state.name)
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.state && this.editor.isAccepting(context.state.name)
  }
}

/**
 * Provider to register `ActionSetNonAccepting` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionSetNonAcceptingProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionSetNonAccepting,
}
