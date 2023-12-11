import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatDividerModule } from '@angular/material/divider'

import { AuthSignInComponent } from '@platon/core/browser'
import { CasSignInComponent } from '@platon/feature/cas/browser'

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AuthSignInComponent, CasSignInComponent, MatDividerModule],
})
export class LoginPage {}
