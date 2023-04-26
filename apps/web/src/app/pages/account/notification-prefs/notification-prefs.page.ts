import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserSearchBarComponent, UserTableComponent } from '@platon/core/browser';
import { User } from '@platon/core/common';



@Component({
  standalone: true,
  selector: 'app-account-notification-prefs',
  templateUrl: './notification-prefs.page.html',
  styleUrls: ['./notification-prefs.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    UserTableComponent,
    UserSearchBarComponent,
  ]
})
export class AccountNotificationPrefsPage {
  protected users: User[] = [];
}
