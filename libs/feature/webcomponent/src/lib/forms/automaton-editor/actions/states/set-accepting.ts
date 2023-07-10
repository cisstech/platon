import { Injectable, Provider } from '@angular/core'
import { AutomatonEditorService } from '../../automaton-editor.service'
import {
  AutomatonEditorAction,
  AutomatonEditorActionContext,
  AUTOMATON_EDITOR_ACTIONS,
} from '../action'

/**
 * Action to turn a state of an automaton to an accepting state.
 */
@Injectable()
export class ActionSetAccepting implements AutomatonEditorAction {
  readonly name = 'Final'

  constructor(private readonly editor: AutomatonEditorService) {}

  run(context: AutomatonEditorActionContext) {
    if (!context.state) {
      return
    }
    this.editor.addAccepting(context.state)
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.state && !this.editor.isAccepting(context.state)
  }
}

/**
 * Provider to register `ActionSetAccepting` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionSetAcceptingProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionSetAccepting,
}
