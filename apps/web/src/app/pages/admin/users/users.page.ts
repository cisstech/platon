import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserSearchBarComponent, UserTableComponent } from '@platon/core/browser';
import { User } from '@platon/core/common';



@Component({
  standalone: true,
  selector: 'app-admin-users',
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
export class AdminUsersPage {
  protected users: User[] = [];
}
