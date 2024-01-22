/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'

import { NzTagModule } from 'ng-zorro-antd/tag'

import { FormsModule } from '@angular/forms'
import { Level, Topic } from '@platon/core/common'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzPopoverModule } from 'ng-zorro-antd/popover'

type Tag = Topic | Level

/*  TODO: use ui-tag-list component internally */
@Component({
  standalone: true,
  selector: 'tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzTagModule, NzIconModule, NzInputModule, NzPopoverModule],
})
export class TagListComponent {
  @Input() tags: Tag[] = []
  @Input() editable = true
  protected inputValue = ''
  protected inputVisible = false

  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef

  @Output() remove = new EventEmitter<Tag>()
  @Output() create = new EventEmitter<string>()

  protected trackById(_: number, tag: Tag) {
    return tag.id
  }

  protected showInput(): void {
    this.inputVisible = true
    setTimeout(() => {
      this.inputElement?.nativeElement.focus()
    }, 10)
  }

  protected handleInputConfirm(): void {
    if (this.inputValue?.trim()) {
      this.create.emit(this.inputValue)
    }
    this.inputValue = ''
    this.inputVisible = false
  }
}
