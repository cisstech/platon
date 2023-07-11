import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'

import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { User, UserGroup } from '@platon/core/common'
import { firstValueFrom } from 'rxjs'
import { UserService } from '../../api/user.service'
import { UserGroupAvatarComponent } from '../user-group-avatar/user-group-avatar.component'

@Component({
  standalone: true,
  selector: 'user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzBadgeModule, NzAvatarModule, NzToolTipModule, UserGroupAvatarComponent],
})
export class UserAvatarComponent {
  @Input() avatarSize = 32
  @Input() user?: User
  @Input() group?: UserGroup
  @Output() showGroupMembers = new EventEmitter<UserGroup>()

  @Input()
  set userIdOrName(value: string) {
    if (value) {
      firstValueFrom(this.authUserService.findByUserName(value)).then((user) => {
        this.user = user
        this.changeDetectorRef.markForCheck()
      })
    }
  }

  get displayName(): string {
    return this.group?.name || this.user?.username || ''
  }

  constructor(private readonly authUserService: UserService, private readonly changeDetectorRef: ChangeDetectorRef) {}
}
