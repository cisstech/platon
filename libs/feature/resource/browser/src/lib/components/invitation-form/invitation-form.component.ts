import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { UserSearchBarComponent } from '@platon/core/browser';
import { User } from '@platon/core/common';
import { CreateResourceInvitation } from '@platon/feature/resource/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  standalone: true,
  selector: 'res-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatButtonModule,

    NzGridModule,
    NzFormModule,
    UserSearchBarComponent
  ]
})
export class ResourceInvitationFormComponent {
  readonly form = new FormGroup({
    'invitee': new FormControl<User | undefined>(undefined, Validators.required),
  });

  @Input()  excludes: string[] = [];

  @Output() send = new EventEmitter<CreateResourceInvitation>();

  protected sendInvitation(): void {
    this.send.emit({
      inviteeId: (this.form.value.invitee as User).id,
      permissions: {
        read: true,
        write: true
      }
    })
  }
}
