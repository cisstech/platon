import { Injectable, Provider } from '@angular/core';
import { DialogService } from '@platon/core/browser';
import { AutomatonEditorService } from '../../automaton-editor.service';
import {
  AutomatonEditorAction,
  AutomatonEditorActionContext,
  AUTOMATON_EDITOR_ACTIONS,
} from '../action';

/**
 * Action to rename a state of an automaton.
 */
@Injectable()
export class ActionRenameState implements AutomatonEditorAction {
  readonly name = 'Renommer';

  constructor(
    private readonly dialog: DialogService,
    private readonly editor: AutomatonEditorService
  ) {}

  async run(context: AutomatonEditorActionContext) {
    if (!context.state) {
      return;
    }

    const oldName = context.state;

    let newName = await this.prompt(
      `Renommer l'état “${oldName}”`,
      oldName
    );

    if (newName && newName.trim()) {
      newName = newName.trim();
      if (this.editor.isState(newName)) {
        this.dialog.error('Il existe déjà un état avec ce nom !');
        return;
      }
      this.editor.renameState(oldName, newName);
    }
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.state;
  }

  private async prompt(
    title: string,
    val: string
  ): Promise<string> {
    return new Promise<string>((resolve) => {
      const data = window.prompt(title, val)
      resolve(data || '');
    })
  }
}

/**
 * Provider to register `ActionRenameState` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionRenameStateProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionRenameState,
};
