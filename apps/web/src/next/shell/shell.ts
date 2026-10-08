import { Dialog as CdkDialog } from '@angular/cdk/dialog'
import { CdkScrollable } from '@angular/cdk/scrolling'
import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked, viewChild } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router'
import {
  Button,
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
  SkipLink,
} from '@platon/design-system'
import { DialogService } from '@platon/core/browser/shared'
import { userDisplayName } from '@platon/core/common'
import { filter, firstValueFrom, map } from 'rxjs'
import { INSTITUTION_NAME } from '../core/institution/institution'
import { Session } from '../core/session/session'
import { NextTheme, ThemePreference } from '../core/theme/next-theme'
import { CHARTER_HEADING_ID, CharterDialog } from './charter-dialog'
import { CreateKind, accountType, coverEntries, createEntries, createTarget, helpInFoot } from './cover.vm'
import { ShellStore } from './shell-store'

const DOCS_URL = '/docs'

/**
 * The frame of the ported screens: the cover on the left, the page on the right. A route that
 * already has a main creation action sets `data: { quietCreate: true }`, and Create turns quiet.
 */
@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    CdkScrollable,
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
    RouterLink,
    RouterOutlet,
    SkipLink,
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
  private readonly messages = inject(DialogService)
  protected readonly theme = inject(NextTheme)
  protected readonly institution = inject(INSTITUTION_NAME)

  private readonly createTrigger = viewChild<MenuTrigger>('createTrigger')
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
  protected readonly quietCreate = computed(() => {
    this.url()
    let route = this.router.routerState.snapshot.root
    while (route.firstChild) route = route.firstChild
    return route.data['quietCreate'] === true
  })
  protected readonly docsUrl = DOCS_URL
  /** Set when the charter is accepted: the menu opens on the button that replaces the first one. */
  private openCreateOnRender = false

  constructor() {
    this.store.load()
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
