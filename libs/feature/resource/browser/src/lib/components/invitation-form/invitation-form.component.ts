import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'

import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzButtonModule } from 'ng-zorro-antd/button'

import { User } from '@platon/core/common'
import { UserSearchBarComponent } from '@platon/core/browser'
import { CreateResourceInvitation } from '@platon/feature/resource/common'

@Component({
  standalone: true,
  selector: 'resource-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    NzGridModule,
    NzFormModule,
    NzButtonModule,

    UserSearchBarComponent,
  ],
})
export class ResourceInvitationFormComponent {
  readonly form = new FormGroup({
    invitee: new FormControl<User | undefined>(undefined, Validators.required),
  })

  @Input() excludes: string[] = []

  @Output() send = new EventEmitter<CreateResourceInvitation>()

  protected sendInvitation(): void {
    this.send.emit({
      inviteeId: (this.form.value.invitee as User).id,
      permissions: {
        read: true,
        write: true,
      },
    })
  }
}
