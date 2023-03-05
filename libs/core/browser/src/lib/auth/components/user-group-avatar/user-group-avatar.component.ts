import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { UserGroup } from '@platon/core/common';
import { RouterModule } from '@angular/router';


@Component({
  standalone: true,
  selector: 'user-group-avatar',
  templateUrl: './user-group-avatar.component.html',
  styleUrls: ['./user-group-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    NzAvatarModule,
    NzToolTipModule,
  ]
})
export class UserGroupAvatarComponent {
  @Input() avatarSize = 32;
  @Input() group!: UserGroup;
}
