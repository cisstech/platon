import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { ResourceVersionComponent, ResourceVersioningComponent } from '@platon/feature/resource/browser'
import { FileVersion, FileVersions, Resource } from '@platon/feature/resource/common'

@Component({
  standalone: true,
  selector: 'app-resource-browse-header',
  templateUrl: 'header.component.html',
  styleUrls: ['header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NzIconModule,
    NzDropDownModule,
    NzSelectModule,
    NzButtonModule,
    NzToolTipModule,
    ResourceVersionComponent,
    ResourceVersioningComponent,
  ],
})
export class ResourceBrowseHeaderComponent {
  @Input() version = 'latest'
  @Input() versions: FileVersions = { all: [] }
  @Input() resource!: Resource
  @Input() canPreview = true
  @Input() canCreateVersion = true

  @Output() edit = new EventEmitter<void>()
  @Output() preview = new EventEmitter<void>()
  @Output() refresh = new EventEmitter<string>()

  protected versionInfo?: FileVersion

  protected onChangeVersion(version: string) {
    this.refresh.emit(version)
    this.versionInfo = this.versions.all.find((v) => v.tag === version)
  }
}
