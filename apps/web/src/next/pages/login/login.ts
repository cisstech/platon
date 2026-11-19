import { LiveAnnouncer } from '@angular/cdk/a11y'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnInit,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core'
import { Router } from '@angular/router'
import { SIGN_IN_TOKEN_REFUSED } from '@platon/core/common'
import {
  Button,
  Field,
  FieldInput,
  Icon,
  LOGO_URL,
  PAGE_CONTENT_ID,
  PasswordReveal,
  SkipLink,
} from '@platon/design-system'
import { CAS_SIGN_IN_FAILED } from '@platon/feature/cas/common'
import { INSTITUTION_NAME, PRESENTATION_URL } from '../../core/institution/institution'
import { SIGN_IN_OFFLINE } from './login-guard'
import { LoginStore } from './login-store'
import {
  SignInFailure,
  casEntries,
  coverFooter,
  coverSentence,
  failureAnnouncement,
  failureMessage,
  signInTarget,
} from './login.vm'

/** The help that says how to get an account, or a new password: accounts are given by the administration. */
const ACCESS_HELP_URL = '/docs/main/overview/login'

/** The failures an address can bring back to the page, by their name in `error`. */
const FAILURES_FROM_ADDRESS = new Map<string | undefined, SignInFailure>([
  [SIGN_IN_TOKEN_REFUSED, 'token'],
  [CAS_SIGN_IN_FAILED, 'cas'],
  [SIGN_IN_OFFLINE, 'offline'],
])

/**
 * The sign-in page, outside the frame: the cover says what PLaTon is, the page signs in, by the
 * institution account first (CAS), then by a PLaTon account. The message under the password has its
 * place reserved, so that nothing moves between the states.
 */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Field, FieldInput, Icon, PasswordReveal, SkipLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  /** From the address: where to go once signed in. */
  readonly next = input<string>()
  /** From the address: why the person is back (`token`, `cas`). */
  readonly error = input<string>()

  protected readonly store = inject(LoginStore)
  private readonly router = inject(Router)
  private readonly announcer = inject(LiveAnnouncer)
  private readonly injector = inject(Injector)
  protected readonly institution = inject(INSTITUTION_NAME)
  protected readonly presentationUrl = inject(PRESENTATION_URL)

  protected readonly logoUrl = LOGO_URL
  protected readonly contentId = PAGE_CONTENT_ID
  protected readonly accessHelpUrl = ACCESS_HELP_URL
  protected readonly sentence = coverSentence(this.institution)
  protected readonly footer = coverFooter(this.institution)
  protected readonly cas = computed(() => casEntries(this.store.cas(), this.next()))
  protected readonly message = computed(() => {
    const failure = this.store.failure()
    return failure ? failureMessage(failure, this.cas().length > 0) : undefined
  })
  /** The fields themselves are at fault: both are marked, without telling which. */
  protected readonly invalid = computed(
    () => this.store.failure() === 'missing' || this.store.failure() === 'credentials'
  )

  private readonly username = viewChild.required<ElementRef<HTMLInputElement>>('username')
  private readonly password = viewChild.required<ElementRef<HTMLInputElement>>('password')

  ngOnInit(): void {
    const failure = FAILURES_FROM_ADDRESS.get(this.error())
    this.store.load(failure)
    // Back from the CAS or a refused link: the failure is on the page from the start, so it is read out.
    const message = this.message()
    if (message) this.announcer.announce(failureAnnouncement(message), 'polite').catch(console.error)
  }

  /**
   * Signs in, then leaves for `next`. On a failure the focus goes to the field to fill again, which
   * the message describes: screen readers read it there.
   */
  protected async signIn(event: Event, username: string, password: string): Promise<void> {
    event.preventDefault()
    if (this.store.submitting()) return
    const signingIn = this.store.signIn(username, password)
    if (this.store.submitting()) this.announcer.announce('Connexion en cours.', 'polite').catch(console.error)
    if (await signingIn) {
      const left = await this.router
        .navigateByUrl(signInTarget(this.next()), { replaceUrl: true })
        .catch((error: unknown) => {
          console.error(error)
          return false
        })
      if (!left) this.store.stopWith('server')
      return
    }
    const field = !username.trim() ? this.username() : this.password()
    afterNextRender(() => field.nativeElement.focus(), { injector: this.injector })
  }

  /** The institution account waits while a sign-in by password is at work. */
  protected holdWhileSigningIn(event: Event): void {
    if (this.store.submitting()) event.preventDefault()
  }
}
