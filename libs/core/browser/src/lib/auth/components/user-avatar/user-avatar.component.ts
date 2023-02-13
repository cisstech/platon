import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';


import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { User } from '@platon/core/common';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../api/user.service';


@Component({
  standalone: true,
  selector: 'user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzIconModule,
    NzBadgeModule,
    NzAvatarModule,
  ]
})
export class UserAvatarComponent {
  @Input() avatarSize = 32;
  @Input() user?: User;

  @Input()
  set userIdOrName(value: string) {
    firstValueFrom(this.authUserService.findByUserName(value)).then(user => {
      this.user = user;
      this.changeDetectorRef.markForCheck();
    });
  }

  get username(): string {
    return this.user?.username || '';
  }


  constructor(
    private readonly authUserService: UserService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }
}
