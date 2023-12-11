import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
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
  protected username = ''
  protected password = ''
  protected connecting = false
  protected user?: User

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService
      .ready()
      .then((user) => {
        this.user = user
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
          this.router.navigateByUrl(next || '/dashboard', { replaceUrl: true })
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  signIn(): void {
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
        this.router.navigateByUrl(next || '/dashboard', { replaceUrl: true })
      })
      .catch((error) => {
        console.log(error)
        this.dialogService.error('Une erreur est survenue lors de la connexion !')
        this.connecting = false
      })
  }
}
