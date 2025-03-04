import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'

import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCardModule } from '@angular/material/card'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatToolbarModule } from '@angular/material/toolbar'

import { ActivatedRoute, Router } from '@angular/router'
import { User } from '@platon/core/common'
import { DialogModule, DialogService } from '../../../dialog'
import { AuthService } from '../../api/auth.service'

@Component({
  standalone: true,
  selector: 'auth-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,

    DialogModule,
  ],
})
export class AuthSignInComponent implements OnInit {
  private readonly router = inject(Router)
  private readonly authService = inject(AuthService)
  private readonly dialogService = inject(DialogService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected user?: User
  protected username = ''
  protected password = ''
  protected connecting = false
  protected callbackTitle = ''

  async ngOnInit(): Promise<void> {
    const success = await this.signInFromURL()
    if (success) {
      return
    }

    this.authService
      .ready()
      .then((user) => {
        this.user = user
        if (user) {
          this.username = user.username
          this.onAfterSignIn().catch(console.error)
        }
        this.changeDetectorRef.markForCheck()
      })
      .catch(console.error)
    const { next } = this.activatedRoute.snapshot.queryParams

    if (
      this.activatedRoute.snapshot.queryParams['access-token'] &&
      this.activatedRoute.snapshot.queryParams['refresh-token']
    ) {
      this.authService
        .signInWithToken({
          accessToken: this.activatedRoute.snapshot.queryParams['access-token'],
          refreshToken: this.activatedRoute.snapshot.queryParams['refresh-token'],
        })
        .then(() => {
          this.router.navigateByUrl(next || '/dashboard', { replaceUrl: true }).catch(console.error)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  protected signOut(): void {
    this.user = undefined
    this.authService.signOut(false).catch(console.error)
  }

  protected signIn(): void {
    const { next } = this.activatedRoute.snapshot.queryParams

    if (this.user && this.user.username === this.username) {
      this.onAfterSignIn(next || '/dashboard', true).catch(console.error)
      return
    }

    this.connecting = true
    this.authService
      .signIn(this.username, this.password)
      .then(() => {
        this.connecting = false
        this.onAfterSignIn(next || '/dashboard').catch(console.error)
      })
      .catch((error) => {
        console.error(error)
        this.dialogService.error('Une erreur est survenue lors de la connexion !')
        this.connecting = false
      })
  }

  protected async signInToExternalApp(): Promise<void> {
    const token = await this.authService.token()
    if (!token) {
      this.dialogService.error('Une erreur est survenue lors de la connexion !')
      return
    }

    const { accessToken, refreshToken } = token
    const origin = location.origin
    const { callbackUrl } = this.activatedRoute.snapshot.queryParams

    location.href = `${callbackUrl}?access-token=${accessToken}&refresh-token=${refreshToken}&origin=${origin}`
  }

  private async signInFromURL(): Promise<boolean> {
    try {
      const { queryParamMap } = this.activatedRoute.snapshot
      const accessToken = queryParamMap.get('access-token') as string
      const refreshToken = queryParamMap.get('refresh-token') as string
      if (accessToken && refreshToken) {
        const next = queryParamMap.get('next')
        await this.authService.signInWithToken({ accessToken, refreshToken })
        await this.onAfterSignIn(next)
        return true
      }
      return false
    } catch (error) {
      console.error(error)
      this.dialogService.error('Une erreur est survenue lors de la connexion automatique !')
      return false
    }
  }

  private async onAfterSignIn(nextUrl?: string | null, bypassCallbackUrl?: boolean): Promise<void> {
    const { callbackUrl, callbackTitle } = this.activatedRoute.snapshot.queryParams
    this.user = await this.authService.ready()
    if (!bypassCallbackUrl && this.user && callbackUrl && callbackTitle) {
      this.callbackTitle = callbackTitle
      this.changeDetectorRef.markForCheck()
      return
    } else if (nextUrl) {
      nextUrl = nextUrl.startsWith('/login') ? '/dashboard' : nextUrl || '/dashboard'
      await this.router.navigateByUrl(nextUrl, { replaceUrl: true }).catch(console.error)
    }
  }
}
