import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { RouterModule } from '@angular/router'
import { NzButtonModule } from 'ng-zorro-antd/button'

@Component({
  standalone: true,
  selector: 'app-no-account',
  templateUrl: './no-account.page.html',
  styleUrls: ['./no-account.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, NzButtonModule, RouterModule],
})
export class NoAccountPage {}
