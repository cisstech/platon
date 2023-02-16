import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ResourceFilesTreeComponent } from '@platon/feature/resource/browser';
import { FileVersions, ResourceFile } from '@platon/feature/resource/common';
import { firstValueFrom, Subscription } from 'rxjs';
import { ResourcePresenter } from '../resource.presenter';

@Component({
  standalone: true,
  selector: 'app-resource-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ResourceFilesTreeComponent
  ]
})
export class ResourceContentComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected context = this.presenter.defaultContext();
  protected tree?: ResourceFile;
  protected versions?: FileVersions;


  constructor(
    private readonly presenter: ResourcePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        this.refreshFiles();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }


  protected async refreshFiles(version = 'latest') {
    const [tree, versions] = await this.presenter.fileTree(version)
    this.tree = tree;
    this.versions= versions;
    this.changeDetectorRef.markForCheck();
  }
}
