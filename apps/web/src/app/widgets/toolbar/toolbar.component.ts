import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
} from '@angular/core'
import { RouterModule } from '@angular/router'

import { MatBadgeModule } from '@angular/material/badge'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import { AuthService, UserAvatarComponent } from '@platon/core/browser'
import { User, UserRoles } from '@platon/core/common'
import { NotificationDrawerComponent } from '@platon/feature/notification/browser'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { ResourceService } from '@platon/feature/resource/browser'

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
  private readonly authService = inject(AuthService)
  private readonly resourceService = inject(ResourceService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  @Output() toggleMenu = new EventEmitter<void>()

  protected user?: User | undefined

  protected canCreateCourse = false
  protected canCreateCircle = false
  protected canCreateExercise = false
  protected canCreateActivity = false

  protected get canCreate(): boolean {
    return this.canCreateCourse || this.canCreateCircle || this.canCreateExercise || this.canCreateActivity
  }

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User

    this.canCreateCourse = this.user.role === UserRoles.admin || this.user.role === UserRoles.teacher

    this.canCreateCircle = this.resourceService.canUserCreateResource(this.user, 'CIRCLE')
    this.canCreateExercise = this.resourceService.canUserCreateResource(this.user, 'EXERCISE')
    this.canCreateActivity = this.resourceService.canUserCreateResource(this.user, 'ACTIVITY')

    this.changeDetectorRef.markForCheck()
  }

  signOut(): void {
    this.authService.signOut()
  }
}
