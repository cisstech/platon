import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  inject,
} from '@angular/core'
import { Router, RouterModule } from '@angular/router'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'

import { AuthService, ThemeService, UserAvatarComponent } from '@platon/core/browser'
import { User, UserRoles } from '@platon/core/common'
import { NotificationDrawerComponent } from '@platon/feature/notification/browser'
import { ResourcePipesModule, ResourceService } from '@platon/feature/resource/browser'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { firstValueFrom, Subscription } from 'rxjs'

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
    MatButtonModule,

    NzIconModule,
    NzBadgeModule,
    NzButtonModule,
    NzPopoverModule,

    ResourcePipesModule,
    UserAvatarComponent,
    NotificationDrawerComponent,
  ],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @Input() drawerOpened = false
  @Output() drawerOpenedChange = new EventEmitter<boolean>()

  private readonly router = inject(Router)
  private readonly authService = inject(AuthService)
  private readonly themeService = inject(ThemeService)
  private readonly resourceService = inject(ResourceService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  private readonly breakpointObserver = inject(BreakpointObserver)

  private readonly subscriptions: Subscription[] = []

  protected user?: User | undefined
  protected personalCircleId?: string | undefined

  protected canCreateCourse = false
  protected canCreateCircle = false
  protected canCreateExercise = false
  protected canCreateActivity = false

  protected get canCreate(): boolean {
    return this.canCreateCourse || this.canCreateCircle || this.canCreateExercise || this.canCreateActivity
  }

  protected get createResourceParentParam(): string | undefined {
    const tree = this.router.parseUrl(this.router.url)
    const { segments } = tree.root.children.primary
    if (segments.length > 1 && segments[0].path === 'resources') {
      return segments[1].path
    }
    return undefined
  }

  get themeIcon(): string {
    return this.themeService.themeIcon
  }

  get mobile(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall])
  }

  get tabletOrBelow(): boolean {
    return this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Tablet])
  }

  async ngOnInit(): Promise<void> {
    this.drawerOpened = !this.breakpointObserver.isMatched([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Tablet])
    this.drawerOpenedChange.emit(this.drawerOpened)

    this.user = (await this.authService.ready()) as User
    this.personalCircleId = (await firstValueFrom(this.resourceService.circle(this.user.username))).id

    this.canCreateCourse = this.user.role === UserRoles.admin || this.user.role === UserRoles.teacher

    this.canCreateCircle = this.resourceService.canUserCreateResource(this.user, 'CIRCLE')
    this.canCreateExercise = this.resourceService.canUserCreateResource(this.user, 'EXERCISE')
    this.canCreateActivity = this.resourceService.canUserCreateResource(this.user, 'ACTIVITY')

    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Tablet])
        .subscribe((state) => {
          if (state.matches && this.drawerOpened) {
            this.drawerOpened = false
            this.drawerOpenedChange.emit(this.drawerOpened)
          }
        }),
      this.breakpointObserver.observe([Breakpoints.Large, Breakpoints.XLarge]).subscribe((state) => {
        if (state.matches && !this.drawerOpened) {
          this.drawerOpened = true
          this.drawerOpenedChange.emit(this.drawerOpened)
        }
        this.changeDetectorRef.markForCheck()
      })
    )

    this.changeDetectorRef.markForCheck()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  signOut(): void {
    this.authService.signOut().catch(console.error)
  }

  darkTheme(): void {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.2s ease-in-out'
    document.body.style.transition = 'none'
    setTimeout(() => {
      this.themeService.darkTheme(true)
    }, 200)

    setTimeout(() => {
      document.body.style.opacity = '1'
      this.changeDetectorRef.markForCheck()
    }, 500)
  }

  lightTheme(): void {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.2s ease-in-out'
    setTimeout(() => {
      this.themeService.lightTheme(true)
    }, 200)
    setTimeout(() => {
      document.body.style.opacity = '1'
      document.body.style.transition = 'none'
      this.changeDetectorRef.markForCheck()
    }, 500)
  }

  systemTheme(): void {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.2s ease-in-out'
    setTimeout(() => {
      this.themeService.systemTheme(true)
    }, 200)
    setTimeout(() => {
      document.body.style.opacity = '1'
      document.body.style.transition = 'none'
      this.changeDetectorRef.markForCheck()
    }, 500)
  }
}
