/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClipboardService } from '@cisstech/nge/services';
import { FileVersions, ResourceFile } from '@platon/feature/resource/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzContextMenuService, NzDropdownMenuComponent, NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTreeModule, NzTreeNode } from 'ng-zorro-antd/tree';


@Component({
  standalone: true,
  selector: 'res-files-tree',
  templateUrl: './files-tree.component.html',
  styleUrls: ['./files-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzTreeModule,
    NzIconModule,
    NzDropDownModule,
    NzEmptyModule,
    NzSpinModule,
    NzSelectModule,
    NzButtonModule,
  ]
})
export class ResourceFilesTreeComponent {
  private readonly _index = new Map<string, ResourceFile>();
  private _tree?: ResourceFile;
  private _selection?: ResourceFile;

  protected loading = true;

  protected nodes: Node[] = [];
  protected version = 'latest';
  protected versionNames: string[] = [];

  @Input()
  set tree(value: ResourceFile | undefined) {
    this._index.clear();
    this._tree = value;

    const createNode = (entry: ResourceFile): any => {
      this._index.set(entry.path, entry);
      return {
        key: entry.path,
        title: entry.path.split('/').pop(),
        isLeaf: !entry.children?.length,
        children: entry.children?.map(createNode).sort(this.compareNodes)
      };
    };

    if (value) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.nodes = value.children!.map(createNode).sort(this.compareNodes)
    } else {
      this.nodes = [];
    }

    this.loading = false;
    this.changeDetectionRef.markForCheck();
  }

  @Input()
  set versions(value: FileVersions) {
    this.versionNames = [
      'latest',
      ...value.all.map(v => v.tag)
    ];
  }

  @Output() refresh = new EventEmitter<string>();

  constructor(
    private readonly nzMessageService: NzMessageService,
    private readonly clipboardService: ClipboardService,
    private readonly changeDetectionRef: ChangeDetectorRef,
    private readonly nzContextMenuService: NzContextMenuService,
  ) { }

  protected contextMenu(
    event: MouseEvent,
    menu: NzDropdownMenuComponent,
    node: NzTreeNode
  ): void {
    this._selection = this._index.get(node.key);
    this.nzContextMenuService.create(event, menu);
  }

  protected copyPath(): void {
    if (this._selection && this._tree) {
      this.clipboardService.copy(
        `${this._tree.resourceId}/${this._selection.path}?version=${this._selection.version}`
      );
      this.nzMessageService.success('Le chemin a été copié dans le presse-papiers');
    }
  }

  protected download(): void {
    if (this._selection) {
      window.open(this._selection.downloadUrl);
    }
  }

  protected emitRefresh(version: string): void {
    this.loading = true;
    this.refresh.emit(version);
  }

  private compareNodes(a: Node, b: Node) {
    if ((a.isLeaf && b.isLeaf) || (!a.isLeaf && !b.isLeaf)) {
      return a.title.localeCompare(b.title);
    }
    return a.isLeaf ? 1 : -1;
  }
}

interface Node {
  key: string;
  title: string;
  isLeaf?: boolean;
  children?: Node[];
}
