import { Dialog as CdkDialog, DialogRef } from '@angular/cdk/dialog'
import { BreakpointObserver } from '@angular/cdk/layout'
import { createGlobalPositionStrategy } from '@angular/cdk/overlay'
import { CdkScrollable } from '@angular/cdk/scrolling'
import { DOCUMENT, NgTemplateOutlet } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router'
import {
  Avatar,
  Button,
  Count,
  Cover,
  CoverBrand,
  CoverCredit,
  CoverFoot,
  CoverItem,
  CoverNav,
  CoverProfile,
  Icon,
  Menu,
  MenuGroup,
  MenuHeader,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Segmented,
  SegmentedOption,
  Sheet,
  SheetField,
  SheetItem,
  SkipLink,
  Topbar,
} from '@platon/design-system'
import { DialogService } from '@platon/core/browser/shared'
import { userDisplayName } from '@platon/core/common'
import { filter, firstValueFrom, map } from 'rxjs'
import { INSTITUTION_NAME } from '../core/institution/institution'
import { Session } from '../core/session/session'
import { NextTheme, ThemePreference } from '../core/theme/next-theme'
import { CHARTER_HEADING_ID, CharterDialog } from './charter-dialog'
import { CreateKind, accountType, coverEntries, createEntries, createTarget, helpInFoot } from './cover.vm'
import { NOTIFICATIONS_HEADING_ID, NotificationsPanel } from './notifications/notifications-panel'
import { unreadLabel } from './notifications/notifications.vm'
import { NotificationsStore } from './notifications/notifications-store'
import { ShellStore } from './shell-store'

const DOCS_URL = '/docs'

/** Below this width the cover gives way to the top bar and its panel. */
export const NARROW_SCREEN = '(max-width: 839.98px)'

/** The notifications open beside the cover, at the bottom, near their entry. */
const NOTIFICATIONS_INSET = 'calc(var(--pl-cover-width) + var(--pl-space-2))'

const PROFILE_HEADING_ID = 'app-profile-sheet-title'

const THEME_OPTIONS: SegmentedOption<ThemePreference>[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Auto' },
]

/**
 * The frame of the ported screens: the cover on the left of the page, or, on a narrow screen, a top
 * bar that opens the cover as a panel and the profile as a sheet. A route that already has a main
 * creation action sets `data: { quietCreate: true }`, and Create turns quiet.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Avatar,
    Button,
    CdkScrollable,
    Count,
    Cover,
    CoverBrand,
    CoverCredit,
    CoverFoot,
    CoverItem,
    CoverNav,
    CoverProfile,
    Icon,
    Menu,
    MenuGroup,
    MenuHeader,
    MenuItem,
    MenuSeparator,
    MenuTrigger,
    NgTemplateOutlet,
    RouterLink,
    RouterOutlet,
    Segmented,
    Sheet,
    SheetField,
    SheetItem,
    SkipLink,
    Topbar,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly router = inject(Router)
  private readonly dialog = inject(CdkDialog)
  private readonly window = inject(DOCUMENT).defaultView
  private readonly session = inject(Session)
  private readonly store = inject(ShellStore)
  private readonly notifications = inject(NotificationsStore)
  private readonly messages = inject(DialogService)
  protected readonly theme = inject(NextTheme)
  protected readonly institution = inject(INSTITUTION_NAME)

  private readonly injector = inject(Injector)
  private readonly createTrigger = viewChild<MenuTrigger>('createTrigger')
  private readonly coverTemplate = viewChild.required<TemplateRef<unknown>>('cover')
  private readonly profileTemplate = viewChild.required<TemplateRef<unknown>>('profileSheet')
  private readonly navigationButton = viewChild('navigationButton', { read: ElementRef })
  private panelRef?: DialogRef<unknown>
  private sheetRef?: DialogRef<unknown>
  private notificationsRef?: DialogRef<unknown, NotificationsPanel>

  private readonly breakpoints = inject(BreakpointObserver)
  protected readonly narrow = toSignal(this.breakpoints.observe(NARROW_SCREEN).pipe(map((state) => state.matches)), {
    initialValue: this.breakpoints.isMatched(NARROW_SCREEN),
  })
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  )

  protected readonly user = this.session.user
  protected readonly name = computed(() => {
    const user = this.user()
    return user ? userDisplayName(user) : ''
  })
  protected readonly role = this.session.role
  protected readonly entries = computed(() => {
    const role = this.role()
    return role ? coverEntries(role, this.store.summaries()) : []
  })
  protected readonly accountType = computed(() => {
    const role = this.role()
    return role ? accountType(role) : undefined
  })
  protected readonly canCreate = this.session.isTeacher
  protected readonly createEntries = computed(() => {
    const role = this.role()
    return role ? createEntries(role) : []
  })
  protected readonly helpInFoot = computed(() => {
    const role = this.role()
    return role ? helpInFoot(role) : false
  })
  protected readonly charterAccepted = this.store.charterAccepted
  protected readonly circleId = this.store.circleId
  private readonly page = computed(() => {
    this.url()
    let route = this.router.routerState.snapshot.root
    while (route.firstChild) route = route.firstChild
    return route
  })
  protected readonly quietCreate = computed(() => this.page().data['quietCreate'] === true)
  /** The title of the page in the top bar, as in the browser tab. */
  protected readonly pageTitle = computed(() => this.page().title ?? 'PLaTon')
  protected readonly unread = this.notifications.unreadCount
  protected readonly unreadLabel = computed(() => unreadLabel(this.unread()))
  /** The bell has no text: its name says the count its badge shows. */
  protected readonly bellLabel = computed(() =>
    this.unread() ? `Notifications, ${this.unread()} ${this.unreadLabel()}` : 'Notifications'
  )
  protected readonly notificationsOpen = signal(false)
  protected readonly themeOptions = THEME_OPTIONS
  protected readonly profileHeadingId = PROFILE_HEADING_ID
  protected readonly docsUrl = DOCS_URL
  /** Set when the charter is accepted: the menu opens on the button that replaces the first one. */
  private openCreateOnRender = false

  constructor() {
    this.store.load()
    this.notifications.connect()
    // Choosing an entry leaves every overlay of the frame.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart),
        takeUntilDestroyed()
      )
      .subscribe(() => this.closeOverlays())
    // The panel and the sheet only exist on a narrow screen, and the notifications change shape across
    // the breakpoint: a screen that narrows closes the notifications, one that widens closes them all.
    effect(() => {
      const narrow = this.narrow()
      untracked(() => (narrow ? this.closeNotifications() : this.closeOverlays()))
    })
    effect(() => {
      const trigger = this.createTrigger()
      if (!trigger || !this.openCreateOnRender) return
      this.openCreateOnRender = false
      untracked(() => trigger.open())
    })
  }

  /** Before the charter is accepted, Create shows it; once accepted, Create opens its menu. */
  protected async acceptCharter(): Promise<void> {
    const dialogRef = this.dialog.open<boolean>(CharterDialog, {
      ariaLabelledBy: CHARTER_HEADING_ID,
      backdropClass: 'pl-scrim',
      restoreFocus: true,
    })
    if (!(await firstValueFrom(dialogRef.closed))) return
    this.openCreateOnRender = true
    if (await this.store.acceptCharter()) return
    this.openCreateOnRender = false
    this.messages.error("Votre accord n'a pas pu être enregistré. Réessayez dans un instant.")
  }

  protected openNavigation(): void {
    this.panelRef = this.dialog.open(this.coverTemplate(), {
      data: 'panel',
      ariaLabel: 'Navigation',
      width: '300px',
      maxWidth: '100vw',
      height: '100dvh',
      positionStrategy: createGlobalPositionStrategy(this.injector).left('0').top('0'),
      panelClass: 'pl-cover-panel',
      backdropClass: 'pl-scrim',
      restoreFocus: true,
    })
  }

  protected closeNavigation(): void {
    this.panelRef?.close()
  }

  /** The profile of the panel: the panel gives way to a sheet, and the focus comes back to the top bar. */
  protected openProfile(): void {
    this.closeNavigation()
    this.sheetRef = this.dialog.open(this.profileTemplate(), {
      ariaLabelledBy: PROFILE_HEADING_ID,
      width: '100vw',
      maxWidth: '100vw',
      positionStrategy: createGlobalPositionStrategy(this.injector).left('0').bottom('0'),
      panelClass: 'pl-sheet-panel',
      backdropClass: 'pl-scrim',
      restoreFocus: this.navigationButton()?.nativeElement ?? true,
    })
  }

  protected closeProfile(): void {
    this.sheetRef?.close()
  }

  /**
   * Beside the cover on a wide screen; on a phone, over the whole screen. The focus comes back to
   * `trigger`: Safari does not focus a button on a click, so what had the focus may be the page.
   */
  protected openNotifications(trigger: EventTarget | null): void {
    this.closeNavigation()
    const narrow = this.narrow()
    const position = createGlobalPositionStrategy(this.injector)
    const dialogRef = this.dialog.open(NotificationsPanel, {
      data: narrow ? 'screen' : 'popover',
      // The store lives with the shell route, above the root injector of the dialogs.
      injector: this.injector,
      ariaLabelledBy: NOTIFICATIONS_HEADING_ID,
      maxWidth: '100vw',
      ...(narrow
        ? { width: '100vw', height: '100dvh', positionStrategy: position.left('0').top('0') }
        : { positionStrategy: position.left(NOTIFICATIONS_INSET).bottom('var(--pl-space-4)') }),
      panelClass: narrow ? 'pl-screen-panel' : 'pl-popover-panel',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      restoreFocus: trigger instanceof HTMLElement ? trigger : true,
    })
    this.notificationsRef = dialogRef
    this.notificationsOpen.set(true)
    dialogRef.closed.subscribe(() => this.notificationsOpen.set(false))
  }

  private closeNotifications(): void {
    this.notificationsRef?.close()
  }

  protected chooseTheme(preference: ThemePreference | undefined): void {
    if (preference) this.theme.choose(preference).catch(console.error)
  }

  protected signOut(): void {
    this.closeProfile()
    this.session.signOut().catch(console.error)
  }

  private closeOverlays(): void {
    this.closeProfile()
    this.closeNavigation()
    this.closeNotifications()
  }

  protected create(kind: CreateKind): void {
    const target = createTarget(kind, this.router.url)
    this.router.navigate([target.path], { queryParams: target.queryParams }).catch(console.error)
  }

  protected chooseFromProfile(value: string): void {
    if (value.startsWith('theme:')) {
      this.theme.choose(value.slice('theme:'.length) as ThemePreference).catch(console.error)
      return
    }
    switch (value) {
      case 'account':
        this.router.navigateByUrl('/account').catch(console.error)
        break
      case 'circle':
        this.router.navigate(['/resources', this.circleId()]).catch(console.error)
        break
      case 'help':
        this.window?.open(DOCS_URL, '_blank', 'noopener')
        break
      case 'sign-out':
        this.session.signOut().catch(console.error)
        break
    }
  }
}
