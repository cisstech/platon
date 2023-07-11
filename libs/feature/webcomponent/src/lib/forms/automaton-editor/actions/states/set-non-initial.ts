import { Injectable, Provider } from '@angular/core'
import { AutomatonEditorService } from '../../automaton-editor.service'
import { AutomatonEditorAction, AutomatonEditorActionContext, AUTOMATON_EDITOR_ACTIONS } from '../action'

/**
 * Action to turn a state of an automaton to an non initial state.
 */
@Injectable()
export class ActionSetNonInitial implements AutomatonEditorAction {
  readonly name = 'Non initial'

  constructor(private readonly editor: AutomatonEditorService) {}

  run(context: AutomatonEditorActionContext) {
    if (!context.state) {
      return
    }
    this.editor.removeInitial(context.state)
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.state && this.editor.isInitial(context.state)
  }
}

/**
 * Provider to register `ActionSetNonInitial` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionSetNonInitialProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionSetNonInitial,
}
