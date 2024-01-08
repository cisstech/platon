import { Injectable, inject } from '@angular/core'
import { CodIcon } from '@cisstech/nge/ui/icon'

import { FileService, TaskService } from '@cisstech/nge-ide/core'
import { CommandGroups, ExplorerService, IExplorerCommand } from '@cisstech/nge-ide/explorer'
import { EditorPresenter } from '../../../editor.presenter'

export const EXPLORER_REPLACE_FOLDER_COMMAND = 'pl.explorer.commands.replace-folder'

@Injectable()
export class ExplorerReplaceFolder implements IExplorerCommand {
  private readonly presenter = inject(EditorPresenter)
  private readonly fileService = inject(FileService)
  private readonly explorerService = inject(ExplorerService)
  private readonly taskService = inject(TaskService)

  readonly id = EXPLORER_REPLACE_FOLDER_COMMAND
  readonly icon = new CodIcon('versions')
  readonly label = 'Ouvrir une autre version'
  readonly group = CommandGroups.GROUP_WORKSPACE

  get enabled(): boolean {
    const [selection] = this.explorerService.selections()
    if (!selection) return false
    const ancestor = this.presenter.findAncestor(selection.uri)
    return !!ancestor?.versions?.length
  }

  async execute(): Promise<void> {
    const [selection] = this.explorerService.selections()
    if (!selection) return

    this.presenter.replaceFolder(selection.uri, this.fileService, this.taskService)
  }
}
