import { Injectable, Injector, NgModule } from '@angular/core'
import {
  CONTRIBUTION,
  CommandService,
  IContribution,
  ToolbarButton,
  ToolbarGroups,
  ToolbarSeparator,
  ToolbarService,
  ViewService,
} from '@cisstech/nge-ide/core'
import { EXPLORER_COMMAND_COPY_PATH, EXPLORER_VIEW_ID, ExplorerService } from '@cisstech/nge-ide/explorer'
import { ExplorerUpdateFolders } from './commands/explorer-update-folders.command'
import { ExplorerCommandUnzip } from './commands/explorer-unzip.command'

@Injectable()
export class PLExplorerContribution implements IContribution {
  readonly id = 'pl.workbench.contrib.explorer'

  activate(injector: Injector) {
    const viewService = injector.get(ViewService)
    const commandService = injector.get(CommandService)
    const toolbarService = injector.get(ToolbarService)
    const explorerService = injector.get(ExplorerService)

    commandService.register(ExplorerCommandUnzip, ExplorerUpdateFolders)

    explorerService.registerCommands(ExplorerCommandUnzip)

    toolbarService.register(
      new ToolbarButton({
        group: ToolbarGroups.FILE,
        command: commandService.find(ExplorerCommandUnzip),
        priority: 2,
      }),
      new ToolbarSeparator(ToolbarGroups.FILE, 1)
    )

    explorerService.registerFileNestingPatterns({
      id: 'ple',
      parent: /(.*).ple$/,
      children: ['${capture}\\.plf', '${capture}\\.plc'],
    })

    viewService.registerCommands({
      viewId: EXPLORER_VIEW_ID,
      command: commandService.find(ExplorerUpdateFolders),
    })
    explorerService.unregisterCommands(EXPLORER_COMMAND_COPY_PATH)
  }
}

@NgModule({
  providers: [
    ExplorerCommandUnzip,
    ExplorerUpdateFolders,
    ExplorerService,
    { provide: CONTRIBUTION, multi: true, useClass: PLExplorerContribution },
  ],
})
export class PlExplorerContributionModule {}
