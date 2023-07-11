import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core'
import { RouterModule } from '@angular/router'

import { MatBadgeModule } from '@angular/material/badge'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import { AuthService, UserAvatarComponent } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { NotificationDrawerComponent } from '@platon/feature/notification/browser'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'

@Component({
  standalone: true,
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatButtonModule,

    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzPopoverModule,

    UserAvatarComponent,
    NotificationDrawerComponent,
  ],
})
export class ToolbarComponent implements OnInit {
  @Output() toggleMenu = new EventEmitter<void>()

  protected user?: User | undefined

  constructor(private readonly authService: AuthService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.ready()
    this.changeDetectorRef.markForCheck()
  }

  signOut(): void {
    this.authService.signOut()
  }
}
