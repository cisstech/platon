import { ComponentType } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, InjectionToken, Injector, Input } from '@angular/core';
import { UserAvatarComponent } from '@platon/core/browser';
import { NOTIFICATION } from '@platon/feature/notification/browser';
import { ResourceEvent, ResourceEventNotification } from '@platon/feature/resource/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { ResourcePipesModule } from '../../pipes';

const ResourceEventToken = new InjectionToken<ResourceEvent>('ResourceEventToken');

@Component({
  standalone: true,
  selector: 'resource-event-member-remove',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserAvatarComponent
  ],
  template: `
  <user-avatar [userIdOrName]="event.actorId" /> a ajouté <user-avatar [userIdOrName]="event.data['userId']" />
  `
})

class MemberCreateEventComponent {
  protected event = inject(ResourceEventToken);
}

@Component({
  standalone: true,
  selector: 'resource-event-member-remove',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserAvatarComponent
  ],
  template: `
  <user-avatar [userIdOrName]="event.actorId" /> a retiré <user-avatar [userIdOrName]="event.data['userId']" />
  `
})

class MemberRemoveEventComponent {
  protected event = inject(ResourceEventToken);
}

@Component({
  standalone: true,
  selector: 'resource-event-new-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserAvatarComponent,
    ResourcePipesModule,
  ],
  template: `
  <user-avatar [userIdOrName]="event.actorId" /> a passé “{{event.data['resourceName']}}” à “{{event.data['newStatus']|resourceStatus}}”
  `
})

class NewStatusItemComponent {
  protected event = inject(ResourceEventToken);
}

@Component({
  standalone: true,
  selector: 'resource-event-new-resource',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    UserAvatarComponent,
    ResourcePipesModule,
  ],
  template: `
  <user-avatar [userIdOrName]="event.actorId" /> à ajouté “{{event.data['resourceName']}}” dans le cercle”
  `
})

class NewResourceEventComponent {
  protected event = inject(ResourceEventToken);
}

@Component({
  standalone: true,
  selector: 'resource-event-item',
  templateUrl: './event-item.component.html',
  styleUrls: ['./event-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzEmptyModule,
    NzTimelineModule,
    UserAvatarComponent,
    ResourcePipesModule,
  ]
})
export class ResourceEventItemComponent {
  @Input()
  set item(value: ResourceEvent) {
    this._item = {
      event: value,
      injector: Injector.create({
        parent: this.injector,
        providers: [{
          provide: ResourceEventToken,
          useValue: value
        }]
      }),
      renderer: {
        MEMBER_CREATE: MemberCreateEventComponent,
        MEMBER_REMOVE: MemberRemoveEventComponent,
        RESOURCE_CREATE: NewResourceEventComponent,
        RESOURCE_STATUS_CHANGE: NewStatusItemComponent,
      }[value.type]
    }
  }

  protected _item!: Item;
  protected isNotification = false;

  constructor(
    private readonly injector: Injector
  ) {
    const notification = injector.get(NOTIFICATION, null)
    if (notification) {
      this.isNotification = true;
      this.item = (
        notification.data as unknown as ResourceEventNotification
      ).eventInfo as ResourceEvent;
    }
  }
}

interface Item {
  event: ResourceEvent,
  injector: Injector,
  renderer: ComponentType<unknown>
}
