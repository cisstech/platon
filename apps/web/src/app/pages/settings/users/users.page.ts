import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserSearchBarComponent, UserTableComponent } from '@platon/core/browser';
import { User } from '@platon/core/common';



@Component({
  standalone: true,
  selector: 'app-settings-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    UserTableComponent,
    UserSearchBarComponent,
  ]
})
export class SettingsUsersPage {
  protected users: User[] = [];
}
