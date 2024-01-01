import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import {
  DialogModule,
  DialogService,
  UserSearchBarComponent,
  UserService,
  UserTableComponent,
} from '@platon/core/browser'
import { UpdateUser, User, UserFilters } from '@platon/core/common'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-admin-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, UserTableComponent, UserSearchBarComponent, DialogModule],
})
export class AdminUsersPage {
  private readonly userService = inject(UserService)
  private readonly dialogService = inject(DialogService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected users: User[] = []
  protected filters: UserFilters = { limit: 10 }

  protected async update(user: User, change: UpdateUser): Promise<void> {
    try {
      const newUser = await firstValueFrom(this.userService.update(user, change))
      this.users = this.users.map((u) => (u.username === newUser.username ? newUser : u))
      this.dialogService.success(`${user.username} a été mis à jour !`)
    } catch {
      this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
