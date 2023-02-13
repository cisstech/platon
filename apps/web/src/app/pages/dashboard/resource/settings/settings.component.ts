import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ResourceInformationsComponent } from './informations/informations.component';
import { ResourceMembersComponent } from './members/members.component';


@Component({
  standalone: true,
  selector: 'app-resource-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    NzTabsModule,

    ResourceInformationsComponent,
    ResourceMembersComponent
  ]
})
export class ResourceSettingsComponent {}
