import { Injectable, inject } from '@angular/core'
import { CommandGroups, ExplorerService, IExplorerCommand } from '@cisstech/nge-ide/explorer'
import { FaIcon } from '@cisstech/nge/ui/icon'
import { ResourceFileService } from '@platon/feature/resource/browser'
import { ResourceFileImpl } from '../../file-system'
import { firstValueFrom } from 'rxjs'
import { FileService } from '@cisstech/nge-ide/core'

export const EXPLORER_COMMAND_FILE_EXPORT = 'pl.explorer.commands.unzip'

const zipExtensions = ['.zip', '.jar', '.war', '.ear', '.rar']

@Injectable()
export class ExplorerCommandUnzip implements IExplorerCommand {
  private readonly fileService = inject(FileService)
  private readonly explorerService = inject(ExplorerService)
  private readonly resourceFileService = inject(ResourceFileService)

  readonly id = EXPLORER_COMMAND_FILE_EXPORT
  readonly icon = new FaIcon('fas fa-file-archive')
  readonly group = CommandGroups.GROUP_CUT_COPY_PASTE
  readonly label = 'Extraire ici'

  get enabled(): boolean {
    const node = this.explorerService.focusedNode() as ResourceFileImpl
    if (!node || node.readOnly) return false
    return node.version === 'latest' && zipExtensions.some((ext) => node.uri.path.endsWith(ext))
  }

  async execute(): Promise<void> {
    const node = this.explorerService.focusedNode() as ResourceFileImpl
    await firstValueFrom(
      this.resourceFileService.move(node.resourceFile, {
        unzip: true,
      })
    )
    await this.fileService.refresh()
  }
}
