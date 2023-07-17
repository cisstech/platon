import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { ResourceInformationsPage } from './informations/informations.page'
import { ResourceMembersPage } from './members/members.page'
import { ResourcePresenter } from '../resource.presenter'

@Component({
  standalone: true,
  selector: 'app-resource-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzTabsModule, ResourceInformationsPage, ResourceMembersPage],
})
export class ResourceSettingsPage {
  protected readonly presenter = inject(ResourcePresenter)
  protected readonly contextChange = this.presenter.contextChange
}
