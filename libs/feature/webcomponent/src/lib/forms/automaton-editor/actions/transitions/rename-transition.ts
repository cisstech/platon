import { Injectable, Provider } from '@angular/core'
import { DialogService } from '@platon/core/browser'
import { AutomatonEditorService } from '../../automaton-editor.service'
import {
  AutomatonEditorAction,
  AutomatonEditorActionContext,
  AUTOMATON_EDITOR_ACTIONS,
} from '../action'

/**
 * Action to rename a transition from an automaton.
 */
@Injectable()
export class ActionRenameTransition implements AutomatonEditorAction {
  readonly name = 'Changer étiquette'

  constructor(
    private readonly dialog: DialogService,
    private readonly editor: AutomatonEditorService
  ) {}

  async run(context: AutomatonEditorActionContext) {
    if (!context.transition) {
      return
    }
    const transition = context.transition

    const title = 'Entrez les symboles en les séparant par une virgule'
    const input = await this.prompt(title, transition.symbols.join(','))

    if (input) {
      const symbols = input
        .split(',')
        .map((symb) => {
          return symb.trim()
        })
        .filter((symb) => !!symb)
      if (symbols.length === 0) {
        this.dialog.error('Vous devez saisir les symboles en les séparant par une virgule')
      } else {
        this.editor.renameTransition(transition, symbols)
      }
    }
  }

  condition(context: AutomatonEditorActionContext) {
    return !!context.transition
  }

  private async prompt(title: string, value: string): Promise<string> {
    return this.dialog.prompt({ title, value, okTitle: 'Renommer' }).then((result) => result || '')
  }
}

/**
 * Provider to register `ActionRenameTransition` service as an `AUTOMATON_EDITOR_ACTIONS`.
 */
export const ActionRenameTransitionProvider: Provider = {
  provide: AUTOMATON_EDITOR_ACTIONS,
  multi: true,
  useClass: ActionRenameTransition,
}
