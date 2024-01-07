import { Injectable, Injector, NgModule } from '@angular/core'
import {
  CONTRIBUTION,
  CommandService,
  IContribution,
  ToolbarButton,
  ToolbarGroups,
  ToolbarSeparator,
  ToolbarService,
} from '@cisstech/nge-ide/core'
import { EXPLORER_COMMAND_COPY_PATH, ExplorerService } from '@cisstech/nge-ide/explorer'
import { ExplorerCommandUnzip } from './commands/explorer-unzip.command'

@Injectable()
export class PLExplorerContribution implements IContribution {
  readonly id = 'pl.workbench.contrib.explorer'

  activate(injector: Injector) {
    const commandService = injector.get(CommandService)
    const toolbarService = injector.get(ToolbarService)
    const explorerService = injector.get(ExplorerService)

    commandService.register(ExplorerCommandUnzip)

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

    explorerService.unregisterCommands(EXPLORER_COMMAND_COPY_PATH)
  }
}

@NgModule({
  providers: [
    ExplorerCommandUnzip,
    ExplorerService,
    { provide: CONTRIBUTION, multi: true, useClass: PLExplorerContribution },
  ],
})
export class PlExplorerContributionModule {}
