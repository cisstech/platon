import { SelectionModel } from '@angular/cdk/collections'
import { FlatTreeControl } from '@angular/cdk/tree'
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  booleanAttribute,
} from '@angular/core'
import { RouterModule } from '@angular/router'
import { CircleTree } from '@platon/feature/resource/common'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTreeModule } from 'ng-zorro-antd/tree'
import { NzTreeFlatDataSource, NzTreeFlattener, NzTreeViewModule } from 'ng-zorro-antd/tree-view'

@Component({
  standalone: true,
  selector: 'resource-circle-tree',
  templateUrl: './circle-tree.component.html',
  styleUrls: ['./circle-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, NzIconModule, NzTreeModule, NzTreeViewModule],
})
export class CircleTreeComponent implements OnInit {
  @Input() tree!: CircleTree

  /**
   * The ids of the selected nodes.
   * @remarks
   * - during initialization, the selection is updated to remove non existing ids.
   */
  @Input() selection: string[] = []

  /**
   * If true, multiple nodes can be selected.
   */
  @Input({ transform: booleanAttribute }) multiple = false

  /**
   * If provided, only nodes with ids in this list will be displayed.
   */
  @Input() visibleNodeIds?: string[]

  /**
   * Disable nodes that are not readable or writable by the current user.
   * @remarks
   * - In non selection mode, non writable nodes are not disabled.
   */
  @Input({ transform: booleanAttribute }) disableFromPermissions = true

  /**
   * Emits the ids of the selected nodes.
   */
  @Output() selectionChange = new EventEmitter<string[]>()

  protected flatNodeMap = new Map<FlatNode, CircleTree>()
  protected nestedNodeMap = new Map<CircleTree, FlatNode>()
  protected checklistSelection = new SelectionModel<FlatNode>(true)
  protected disabled = false

  protected treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable
  )

  protected get selectable(): boolean {
    return this.selectionChange.observed
  }

  protected treeFlattener = new NzTreeFlattener(
    this.transformer.bind(this),
    (node) => node.level,
    (node) => node.expandable,
    (node) => {
      const children = this.visibleNodeIds
        ? node.children?.filter((c) => this.visibleNodeIds?.includes(c.id))
        : node.children
      return children
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected dataSource = new NzTreeFlatDataSource(this.treeControl as any, this.treeFlattener)

  ngOnInit(): void {
    this.dataSource.setData([this.tree])
    if (this.selectable) {
      this.treeControl.expandAll()
    } else {
      const firstNode = this.treeControl.dataNodes[0]
      if (firstNode) {
        this.treeControl.expand(firstNode)
      }
    }

    this.checklistSelection.select(...this.treeControl.dataNodes.filter((node) => this.selection.includes(node.id)))
    this.selectionChange.emit(this.checklistSelection.selected.map((n) => n.id))
  }

  protected hasChild = (_: number, node: FlatNode) => node.expandable

  protected trackBy = (_: number, node: FlatNode) => `${node.id}-${node.name}`

  protected transformer(node: CircleTree, level: number): FlatNode {
    const existingNode = this.nestedNodeMap.get(node)
    const flatNode =
      existingNode && existingNode.id === node.id
        ? existingNode
        : {
            id: node.id,
            name: node.name,
            version: 'latest',
            level: level,
            disabled:
              this.disableFromPermissions && (!node.permissions?.read || (this.selectable && !node.permissions?.write)),
            expandable: !!node.children && node.children.length > 0,
          }
    flatNode.name = node.name
    this.flatNodeMap.set(flatNode, node)
    this.nestedNodeMap.set(node, flatNode)
    return flatNode
  }

  protected selectionToggle(node: FlatNode): void {
    if (this.checklistSelection.isSelected(node)) {
      this.checklistSelection.deselect(node)
    } else {
      if (!this.multiple) {
        this.checklistSelection.clear()
      }
      this.checklistSelection.select(node)
    }
    this.selectionChange.emit(this.checklistSelection.selected.map((n) => n.id))
  }
}

interface FlatNode {
  id: string
  name: string
  version: string
  disabled: boolean
  expandable: boolean
  level: number
}
