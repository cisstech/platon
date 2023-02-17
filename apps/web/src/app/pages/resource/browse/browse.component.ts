import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgeUiIconModule } from '@cisstech/nge/ui/icon';
import { ResourceFilesComponent } from '@platon/feature/resource/browser';
import { FileVersions, ResourceFile } from '@platon/feature/resource/common';
import { Subscription } from 'rxjs';
import { ResourcePresenter } from '../resource.presenter';
import { ResourceBrowseHeaderComponent } from './header/header.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ResourceEditorComponent } from './editor/editor.component';


@Component({
  standalone: true,
  selector: 'app-resource-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,

    NzModalModule,
    NgeUiIconModule,

    ResourceFilesComponent,
    ResourceEditorComponent,
    ResourceBrowseHeaderComponent,
  ]
})
export class ResourceBrowseComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected context = this.presenter.defaultContext();
  protected tree?: ResourceFile;
  protected editing = false;
  protected version = 'latest';
  protected versions?: FileVersions;

  constructor(
    private readonly presenter: ResourcePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        this.refresh();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected async refresh(version = 'latest') {
    this.editing = false;
    this.version = version;
    const [tree, versions] = await this.presenter.files(version)
    this.tree = tree;
    this.versions = versions;
    this.changeDetectorRef.markForCheck();
  }
}
