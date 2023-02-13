import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';


import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { NgeUiListModule } from '@cisstech/nge/ui/list';
import { Resource, ResourceTypes, ResourceVisibilities } from '@platon/feature/resource/common';


import { ResourcePipesModule } from '../../pipes';


@Component({
  standalone: true,
  selector: 'res-item',
  templateUrl: './resource-item.component.html',
  styleUrls: ['./resource-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    MatIconModule,
    NzBadgeModule,

    NgeUiListModule,

    ResourcePipesModule,
  ]
})
export class ResourceItemComponent implements OnInit {
  @Input() item!: Resource;
  @Input() simple = false;
  @Output() didTapTag = new EventEmitter<string>();

  protected name = '';
  protected desc = '';
  protected tags: string[] = []

  ngOnInit(): void {
    if (!this.simple) {
      this.item.levels?.forEach(level => this.tags.push(level.name))
      this.item.topics?.forEach(topic => this.tags.push(topic.name))
    }

    this.name = this.item.name;
    this.desc = this.item.desc as string;

    if (this.simple) {
      this.desc = '';
    }
  }

}
