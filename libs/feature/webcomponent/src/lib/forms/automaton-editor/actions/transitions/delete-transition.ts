import { Injectable, Provider } from '@angular/core';
import { AutomatonEditorService } from '../../automaton-editor.service';
import {
  AutomatonEditorAction,
  AutomatonEditorActionContext,
  AUTOMATON_EDITOR_ACTIONS,
} from '../action';

/**
 * Action to remove a transition from an automaton.
 */
@Injectable()
export class ActionDeleteTransition implements AutomatonEditorAction {
  readonly name = 'Supprimer transition';

  constructor(private readonly editor: AutomatonEditorService) {}

  run(context: AutomatonEditorActionContext) {
    if (!context.transition) {
      return;
    }
    this.editor.removeTransition(context.transition);
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.transition;
  }
}

/**
 * Provider to register `ActionDeleteTransition` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionDeleteTransitionProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionDeleteTransition,
};
