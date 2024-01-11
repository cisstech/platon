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
import { Subscription } from 'rxjs'
import { ExplorerReplaceFolder } from './commands/explorer-replace-folder.command'
import { ExplorerCommandUnzip } from './commands/explorer-unzip.command'
import { ExplorerUpdateFolders } from './commands/explorer-update-folders.command'

@Injectable()
export class PLExplorerContribution implements IContribution {
  private readonly subscriptions: Subscription[] = []

  readonly id = 'pl.workbench.contrib.explorer'

  activate(injector: Injector) {
    const viewService = injector.get(ViewService)
    const commandService = injector.get(CommandService)
    const toolbarService = injector.get(ToolbarService)
    const explorerService = injector.get(ExplorerService)

    commandService.register(ExplorerCommandUnzip, ExplorerUpdateFolders, ExplorerReplaceFolder)

    explorerService.registerCommands(ExplorerCommandUnzip, ExplorerReplaceFolder)

    explorerService.unregisterCommands(EXPLORER_COMMAND_COPY_PATH)

    explorerService.registerFileNestingPatterns({
      id: 'ple',
      parent: /(.*).ple$/,
      children: ['${capture}\\.plf', '${capture}\\.plc', '${capture}\\.plo'],
    })

    viewService.registerCommands({
      viewId: EXPLORER_VIEW_ID,
      command: commandService.find(ExplorerUpdateFolders),
    })

    toolbarService.register(
      new ToolbarButton({
        group: ToolbarGroups.FILE,
        command: commandService.find(ExplorerCommandUnzip),
        priority: 2,
      }),
      new ToolbarSeparator(ToolbarGroups.FILE, 1)
    )
  }

  deactivate() {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }
}

@NgModule({
  providers: [
    ExplorerCommandUnzip,
    ExplorerUpdateFolders,
    ExplorerReplaceFolder,
    ExplorerService,
    { provide: CONTRIBUTION, multi: true, useClass: PLExplorerContribution },
  ],
})
export class PlExplorerContributionModule {}
