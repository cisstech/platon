import { ComponentType } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, InjectionToken, Injector, Input } from '@angular/core';
import { UserAvatarComponent } from '@platon/core/browser';
import { ResourceEvent } from '@platon/feature/resource/common';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { ResourcePipesModule } from '../../pipes';

const ResourceEventToken = new InjectionToken<ResourceEvent>('ResourceEventToken');

@Component({
  standalone: true,
  selector: 'res-event-member-remove',
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
  selector: 'res-event-member-remove',
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
  selector: 'res-event-new-status',
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
  selector: 'res-event-new-resource',
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
  selector: 'res-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzEmptyModule,
    NzTimelineModule,
    UserAvatarComponent,
    ResourcePipesModule,
  ]
})
export class ResourceEventListComponent {
  @Input()
  set items(value: ResourceEvent[]) {
    this.events = value.map(event => ({
      event,
      injector: Injector.create({
        parent: this.injector,
        providers: [{
          provide: ResourceEventToken,
          useValue: event
        }]
      }),
      renderer: {
        MEMBER_CREATE: MemberCreateEventComponent,
        MEMBER_REMOVE: MemberRemoveEventComponent,
        RESOURCE_CREATE: NewResourceEventComponent,
        RESOURCE_STATUS_CHANGE: NewStatusItemComponent,
      }[event.type]
    }))
  }

  protected events: Item[] = [];


  constructor(
    private readonly injector: Injector
  ) { }

  trackById(_: number, item: Item) {
    return item.event.id;
  }
}

interface Item {
  event: ResourceEvent,
  injector: Injector,
  renderer: ComponentType<unknown>
}
