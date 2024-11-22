import { ComponentType } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  InjectionToken,
  Injector,
  Input,
  OnInit,
} from '@angular/core'
import { AuthService, UserAvatarComponent } from '@platon/core/browser'
import { NOTIFICATION } from '@platon/feature/notification/browser'
import { Notification } from '@platon/feature/notification/common'
import {
  ResourceCreateEvent,
  ResourceEvent,
  ResourceEventNotification,
  ResourceMemberCreateEvent,
  ResourceMemberRemoveEvent,
  ResourceStatusChangeEvent,
} from '@platon/feature/resource/common'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { NzTimelineModule } from 'ng-zorro-antd/timeline'
import { ResourcePipesModule } from '../../pipes'

const ResourceEventToken = new InjectionToken<ResourceEvent>('ResourceEventToken')

@Component({
  standalone: true,
  selector: 'resource-event-member-remove',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, UserAvatarComponent],
  template: `
    <ng-container *ngIf="isMe">Vous êtes désormais membre de “{{ event.data.resourceName }}”</ng-container>
    <ng-container *ngIf="!isMe && !isJoinRequest">
      <user-avatar showUsername="inline" [userIdOrName]="event.data.userId" />
      est désormais membre de “{{ event.data.resourceName }}”
    </ng-container>
    <ng-container *ngIf="isJoinRequest">
      <user-avatar showUsername="inline" [userIdOrName]="event.data.userId" />
      souhaite rejoindre le cercle “{{ event.data.resourceName }}”
    </ng-container>
    <ng-template #avatar>
      <user-avatar showUsername="inline" [userIdOrName]="event.data.userId" />
      est désormais membre de “{{ event.data.resourceName }}”
    </ng-template>
  `,
})
class MemberCreateEventComponent implements OnInit {
  private readonly auth = inject(AuthService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected isMe = false
  protected isJoinRequest = false
  protected event = inject(ResourceEventToken) as ResourceMemberCreateEvent

  async ngOnInit(): Promise<void> {
    const user = await this.auth.ready()

    this.isMe = user?.id === this.event.data.userId
    this.isJoinRequest = this.event.data.userId === this.event.actorId

    this.changeDetectorRef.markForCheck()
  }
}

@Component({
  standalone: true,
  selector: 'resource-event-member-remove',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, UserAvatarComponent],
  template: `
    <ng-container *ngIf="notification; else noNotification">
      Vous n'êtes plus membre de “{{ event.data.resourceName }}”
    </ng-container>
    <ng-template #noNotification>
      <user-avatar showUsername="inline" [userIdOrName]="event.actorId" /> n'a plus accès à cette ressource
    </ng-template>
  `,
})
class MemberRemoveEventComponent {
  protected event = inject(ResourceEventToken) as ResourceMemberRemoveEvent
  protected notification = inject(NOTIFICATION, { optional: true })
}

@Component({
  standalone: true,
  selector: 'resource-event-new-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserAvatarComponent, ResourcePipesModule],
  template: `
    <user-avatar showUsername="inline" [userIdOrName]="event.actorId" /> a passé “{{ event.data.resourceName }}” à “{{
      $any(event.data.newStatus) | resourceStatus
    }}”
  `,
})
class NewStatusItemComponent {
  protected event = inject(ResourceEventToken) as ResourceStatusChangeEvent
}

@Component({
  standalone: true,
  selector: 'resource-event-new-resource',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserAvatarComponent, ResourcePipesModule],
  template: `
    <user-avatar showUsername="inline" [userIdOrName]="event.actorId" /> a ajouté “{{ event.data.resourceName }}” dans
    le cercle ”{{ event.data.parentName }}”
  `,
})
class NewResourceEventComponent {
  protected event = inject(ResourceEventToken) as ResourceCreateEvent
}

@Component({
  standalone: true,
  selector: 'resource-event-item',
  templateUrl: './event-item.component.html',
  styleUrls: ['./event-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzEmptyModule, NzTimelineModule, UserAvatarComponent, ResourcePipesModule],
})
export class ResourceEventItemComponent {
  @Input()
  set item(value: ResourceEvent) {
    this._item = {
      event: value,
      injector: Injector.create({
        parent: this.injector,
        providers: [
          {
            provide: ResourceEventToken,
            useValue: value,
          },
          ...(this.notification ? [{ provide: NOTIFICATION, useValue: this.notification }] : []),
        ],
      }),
      renderer: {
        MEMBER_CREATE: MemberCreateEventComponent,
        MEMBER_REMOVE: MemberRemoveEventComponent,
        RESOURCE_CREATE: NewResourceEventComponent,
        RESOURCE_STATUS_CHANGE: NewStatusItemComponent,
      }[value.type],
    }
  }

  protected _item!: Item

  protected injector = inject(Injector)
  protected notification = inject(NOTIFICATION, { optional: true }) as Notification<ResourceEventNotification>

  constructor() {
    if (this.notification) {
      this.item = this.notification.data.eventInfo
    }
  }
}

interface Item {
  event: ResourceEvent
  injector: Injector
  renderer: ComponentType<unknown>
}
