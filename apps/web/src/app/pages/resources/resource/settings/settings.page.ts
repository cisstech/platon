import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { ResourceInformationsPage } from './informations/informations.page'
import { ResourceMembersPage } from './members/members.page'
import { ResourcePresenter } from '../resource.presenter'
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'

@Component({
  standalone: true,
  selector: 'app-resource-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzTabsModule, ResourceInformationsPage, ResourceMembersPage],
})
export class ResourceSettingsPage {
  private readonly breakpointObserver = inject(BreakpointObserver)
  protected readonly presenter = inject(ResourcePresenter)
  protected readonly contextChange = this.presenter.contextChange

  get isMobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small])
  }
}
