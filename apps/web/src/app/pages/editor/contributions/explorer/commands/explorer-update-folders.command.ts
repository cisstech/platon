import { Injectable, inject } from '@angular/core'
import { CodIcon } from '@cisstech/nge/ui/icon'

import { FileService, ICommand, TaskService } from '@cisstech/nge-ide/core'
import { EditorPresenter } from '../../../editor.presenter'

export const EXPLORER_COMMAND_REGISTER_FOLDER = 'pl.explorer.commands.update-folders'

@Injectable()
export class ExplorerUpdateFolders implements ICommand {
  private readonly presenter = inject(EditorPresenter)
  private readonly fileService = inject(FileService)
  private readonly taskService = inject(TaskService)

  readonly id = EXPLORER_COMMAND_REGISTER_FOLDER
  readonly icon = new CodIcon('root-folder')
  readonly label = 'Modifier les dossiers racines'

  readonly enabled = this.presenter.hasAncestors

  async execute(): Promise<void> {
    this.presenter.updateRootFolders(this.fileService, this.taskService)
  }
}
