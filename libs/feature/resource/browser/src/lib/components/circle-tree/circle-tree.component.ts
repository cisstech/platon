import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CircleTree } from '@platon/feature/resource/common';
import { NzTreeModule } from 'ng-zorro-antd/tree';
import { NzTreeFlatDataSource, NzTreeFlattener, NzTreeViewModule } from 'ng-zorro-antd/tree-view';

@Component({
  standalone: true,
  selector: 'res-circle-tree',
  templateUrl: './circle-tree.component.html',
  styleUrls: ['./circle-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    NzTreeModule,
    NzTreeViewModule,
  ]
})
export class CircleTreeComponent implements OnInit {
  @Input() tree!: CircleTree;
  @Input() selection?: string;
  @Output() selectionChange = new EventEmitter<string>();

  protected flatNodeMap = new Map<FlatNode, CircleTree>();
  protected nestedNodeMap = new Map<CircleTree, FlatNode>();
  protected checklistSelection = new SelectionModel<FlatNode>(true);

  protected treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable
  )

  protected get selectable(): boolean {
    return this.selectionChange.observed;
  }

  protected treeFlattener = new NzTreeFlattener(
    this.transformer.bind(this),
    node => node.level,
    node => node.expandable,
    node => node.children
  )

  protected dataSource = new NzTreeFlatDataSource(this.treeControl, this.treeFlattener);


  ngOnInit(): void {
    this.dataSource.setData([this.tree]);
    this.treeControl.expandAll();
    if (this.selection) {
      for (const node of this.flatNodeMap.keys()) {
        if (node.id === this.selection) {
          this.selectionToggle(node);
          return;
        }
      }
      this.selectionChange.emit(this.selection = undefined);
    }
  }

  protected hasChild = (_: number, node: FlatNode) => node.expandable;

  protected trackBy = (_: number, node: FlatNode) => `${node.id}-${node.name}`;

  protected transformer(node: CircleTree, level: number): FlatNode {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.id === node.id
        ? existingNode
        : {
          id: node.id,
          name: node.name,
          level: level,
          expandable: !!node.children && node.children.length > 0,
        };
    flatNode.name = node.name;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  protected selectionToggle(node: FlatNode): void {
    if (this.checklistSelection.isSelected(node)) {
      this.checklistSelection.clear();
      this.selectionChange.emit(undefined);
    } else {
      this.checklistSelection.clear();
      this.checklistSelection.select(node)
      this.selectionChange.emit(node.id);
    }
  }
}

interface FlatNode {
  id: string;
  name: string;
  expandable: boolean;
  level: number;
}
