import { Injectable, Provider } from '@angular/core';
import { AutomatonEditorService } from '../../automaton-editor.service';
import {
  AutomatonEditorAction,
  AutomatonEditorActionContext,
  AUTOMATON_EDITOR_ACTIONS,
} from '../action';

/**
 * Action to remove a state from an automaton.
 */
@Injectable()
export class ActionDeleteState implements AutomatonEditorAction {
  readonly name = 'Supprimer';

  constructor(private readonly editor: AutomatonEditorService) {}

  run(context: AutomatonEditorActionContext) {
    if (!context.state) {
      return;
    }
    this.editor.removeState(context.state);
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.state;
  }
}

/**
 * Provider to register `ActionDeleteState` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionDeleteStateProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionDeleteState,
};
