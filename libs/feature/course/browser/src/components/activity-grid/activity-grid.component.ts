import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, ViewChild, ElementRef } from '@angular/core'

import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzSegmentedModule } from 'ng-zorro-antd/segmented'
import { NzTabsModule } from 'ng-zorro-antd/tabs'

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Activity } from '@platon/feature/course/common'
import { CourseActivityCardComponent } from '../activity-card/activity-card.component'
import { CdkDragDrop, CdkDragMove, CdkDragStart, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'

@Component({
  standalone: true,
  selector: 'course-activity-grid',
  templateUrl: './activity-grid.component.html',
  styleUrls: ['./activity-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzTabsModule,
    NzSegmentedModule,
    DragDropModule,
    ReactiveFormsModule,
    CourseActivityCardComponent,
  ],
})
export class CourseActivityGridComponent {
  protected tabs: Tab[] = []
  protected empty = false
  protected tabTitles: string[] = []
  protected selectedIndex = 0
  protected state = {
    words: ['Hello', 'World'],
  }
  @ViewChild('preview') previewContainer!: ElementRef

  @Input() editmode = false

  @Input()
  set items(value: Activity[]) {
    this.tabs = [
      { title: 'Tout', items: value }, // Keep at first position
      { title: 'Ouvert', items: value.filter((item) => item.state === 'opened') },
      { title: 'À venir', items: value.filter((item) => item.state === 'planned') },
      { title: 'Fermé', items: value.filter((item) => item.state === 'closed') },
    ]

    this.tabTitles = this.tabs.map((tab) => tab.title)

    this.empty = !value.length
  }

  drop(event: CdkDragDrop<Activity[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray<Activity>(event.container.data, event.previousIndex, event.currentIndex)
    }
  }

  dragStarted(event: CdkDragStart): void {
    event.source.element.nativeElement.style.backgroundColor = 'red'
    event.source.element.nativeElement.style.width = '20px'
    event.source.element.nativeElement.style.maxWidth = '40px'

    event.source.previewContainer
  }

  setStyle(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      event.target.style.backgroundColor = 'red'
      event.target.style.width = '20px'
    }
  }

  onDragMove(event: CdkDragMove<unknown>): void {
    const previewelem = document.querySelector('.cdk-drag.cdk-drag-preview') as HTMLElement
    if (!previewelem) {
      return
    }
    const nodeMovePreview = new ElementRef<HTMLElement>(previewelem)
    const xPos = event.pointerPosition.x - 100
    const yPos = event.pointerPosition.y - 100
    if (nodeMovePreview?.nativeElement) {
      nodeMovePreview.nativeElement.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`
    }
  }

  protected trackActivity(_: number, item: Activity): string {
    return item.id
  }
}

interface Tab {
  title: string
  items: Activity[]
}
