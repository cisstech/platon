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

  async ngOnInit(): Promise<void> {
    this.authService
      .ready()
      .then((user) => {
        this.user = user
        if (user) {
          this.username = user.username
        }
        this.changeDetectorRef.markForCheck()
      })
      .catch(console.error)
    await this.signInFromURL()
  }

  protected signIn(): void {
    const { next } = this.activatedRoute.snapshot.queryParams

    if (this.user && this.user.username === this.username) {
      this.router.navigateByUrl(next || '/dashboard', { replaceUrl: true })
      return
    }

    this.connecting = true
    this.authService
      .signIn(this.username, this.password)
      .then(() => {
        this.connecting = false
        this.router.navigateByUrl(this.withNextUrl(next), { replaceUrl: true })
      })
      .catch((error) => {
        console.log(error)
        this.dialogService.error('Une erreur est survenue lors de la connexion !')
        this.connecting = false
      })
  }

  protected signOut(): void {
    this.user = undefined
    this.authService.signOut()
  }

  private async signInFromURL(): Promise<void> {
    const { queryParamMap } = this.activatedRoute.snapshot
    const accessToken = queryParamMap.get('access-token') as string
    const refreshToken = queryParamMap.get('refresh-token') as string
    if (accessToken && refreshToken) {
      const next = queryParamMap.get('next')
      await this.authService.signInWithToken({ accessToken, refreshToken })
      this.router.navigateByUrl(this.withNextUrl(next), { replaceUrl: true })
    }
  }

  private withNextUrl(url?: string | null): string {
    if (url?.startsWith('/login')) {
      return '/dashboard'
    }
    return url || '/dashboard'
  }
}
