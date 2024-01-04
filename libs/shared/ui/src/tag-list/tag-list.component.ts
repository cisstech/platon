/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'

import { NzTagModule } from 'ng-zorro-antd/tag'

import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop'
import { FormsModule } from '@angular/forms'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzPopoverModule } from 'ng-zorro-antd/popover'

@Component({
  standalone: true,
  selector: 'ui-tag-input',
  template: `
    @if (multiline) {
    <textarea
      #input
      nz-input
      type="text"
      placeholder="Entrez une valeur et validez en quittant le champ"
      [(ngModel)]="value"
      (blur)="handleFinish()"
    >
    </textarea>
    } @else {
    <input
      #input
      nz-input
      type="text"
      placeholder="Entrez une valeur et validez en quittant le champ"
      [(ngModel)]="value"
      [style.width]="small ? '180px' : '100%'"
      (blur)="handleFinish()"
      (keydown.enter)="handleFinish()"
    />
    }
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzTagModule, NzIconModule, NzInputModule, NzPopoverModule],
})
export class TagInputComponent implements AfterViewInit {
  @ViewChild('input', { static: false })
  inputRef?: ElementRef<HTMLInputElement | HTMLTextAreaElement>

  @Input() value = ''
  @Input() small = true
  @Input() multiline = false

  @Output() edited = new EventEmitter<string>()
  @Output() finished = new EventEmitter<void>()

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.inputRef?.nativeElement.focus()
    }, 500)
  }

  protected handleFinish(): void {
    if (this.value?.trim()) {
      this.edited.emit(this.value)
    }
    this.value = ''
    this.finished.next()
  }
}

@Component({
  standalone: true,
  selector: 'ui-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TagInputComponent,
    NzTagModule,
    NzIconModule,
    NzInputModule,
    NzPopoverModule,
  ],
})
export class UiTagListComponent {
  @Input() tags?: string[] = []
  @Input() small = true
  @Input() editable = true
  @Input() addLabel = 'Nouveau'
  @Input() multiline = false
  @Input() vertical = false

  @Output() edit = new EventEmitter<{ index: number; value: string }>()
  @Output() reorder = new EventEmitter<string[]>()
  @Output() remove = new EventEmitter<number>()
  @Output() create = new EventEmitter<string>()

  protected value = ''
  protected creating = false
  protected editingIndex = -1

  protected handleReorder(event: CdkDragDrop<string[]>): void {
    if (!this.tags || !this.editable || !this.reorder.observed) return
    moveItemInArray(this.tags, event.previousIndex, event.currentIndex)
    this.reorder.emit(this.tags)
  }
}
