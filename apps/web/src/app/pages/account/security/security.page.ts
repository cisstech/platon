import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { NzButtonModule } from 'ng-zorro-antd/button'

import { MatCardModule } from '@angular/material/card'
import {
  AuthEditPasswordComponent,
  AuthService,
  DialogModule,
  DialogService,
  passwordMatches,
  ProtectedComponent,
  UserService,
} from '@platon/core/browser'
import { HTTP_STATUS_CODE, User } from '@platon/core/common'
import { HttpErrorResponse } from '@angular/common/http'

@Component({
  standalone: true,
  selector: 'app-account-security',
  templateUrl: './security.page.html',
  styleUrls: ['./security.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    MatCardModule,
    MatInputModule,
    MatFormFieldModule,

    NzButtonModule,

    DialogModule,
    ProtectedComponent,
    AuthEditPasswordComponent,
  ],
})
export class AcccountSecurityPage {
  private user!: User
  protected readonly form = this.fb.group(
    {
      password: [['', ''], Validators.required],
    },
    { validators: [passwordMatches()] }
  )

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly dialogService: DialogService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  protected async onConnect(user: User): Promise<void> {
    this.user = user
  }

  protected async update(): Promise<void> {
    try {
      const { password } = this.form.value
      await Promise.all([
        this.authService.resetPassword({
          username: this.user.username,
          password: password?.[0] || '',
          newPassword: password?.[1] as string,
        }),
      ])
      this.dialogService.success('Votre mot de passe a été mise à jour !')
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === HTTP_STATUS_CODE.FORBIDDEN) {
        this.dialogService.error(`Votre mot de passe actuel n'est pas valide !`)
        return
      }
      this.dialogService.error('Une erreur est survenue, veuillez réessayer un peu plus tard !')
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
