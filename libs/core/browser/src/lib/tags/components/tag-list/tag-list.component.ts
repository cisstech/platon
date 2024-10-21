/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'

import { NzTagModule } from 'ng-zorro-antd/tag'

import { FormsModule } from '@angular/forms'
import { Level, Topic } from '@platon/core/common'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzPopoverModule } from 'ng-zorro-antd/popover'
import { NzModalModule, NzModalService, OnClickCallback } from 'ng-zorro-antd/modal'

type Tag = Topic | Level

/*  TODO: use ui-tag-list component internally */
@Component({
  standalone: true,
  selector: 'tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, NzTagModule, NzIconModule, NzInputModule, NzPopoverModule, NzModalModule],
})
export class TagListComponent {
  @Input() tags: Tag[] = []
  @Input() editable = true
  protected inputValue = ''
  protected inputVisible = false

  @ViewChild('inputElement', { static: false }) inputElement?: ElementRef

  @Output() remove = new EventEmitter<Tag>()
  @Output() create = new EventEmitter<string>()
  @Output() update = new EventEmitter<Tag>()

  constructor(private modalService: NzModalService) {}

  protected trackById(_: number, tag: Tag) {
    return tag.id
  }

  protected showInput(): void {
    this.inputVisible = true
    setTimeout(() => {
      this.inputElement?.nativeElement.focus()
    }, 10)
  }

  showConfirm(
    onOk: () => (false | void) | Promise<false | void>,
    onCancel: () => (false | void) | Promise<false | void>
  ): void {
    this.modalService.confirm(
      {
        nzTitle: 'Attention',
        nzContent: 'Vous êtes sur le point de fusionner deux tags, êtes-vous sûr de vouloir continuer ?',
        nzOkText: 'Continuer',
        nzCancelText: 'Annuler',
        nzOnOk: async () => onOk(),
        nzOnCancel: async () => onCancel(),
        nzAutofocus: 'ok',
      },
      'warning'
    )
  }

  protected ondoubleclick(event: MouseEvent, tag: Tag): void {
    const target = event.target as HTMLElement
    const input = document.createElement('input')
    input.value = tag.name
    input.setAttribute('type', 'text')
    input.setAttribute('nzSize', 'small')
    input.setAttribute('nz-input', '')
    input.addEventListener('blur', () => {
      if (input.value === tag.name) {
        input.remove()
        target.style.display = 'inline-block'
        return
      }
      const newTag = { ...tag, name: input.value }
      if (this.tags.find((t) => t.name === newTag.name && t.id !== newTag.id)) {
        this.showConfirm(
          () => {
            this.update.emit(newTag)
            input.remove()
            target.style.display = 'inline-block'
          },
          () => {
            input.remove()
            target.style.display = 'inline-block'
          }
        )
      } else {
        this.update.emit(newTag)
        input.remove()
        target.style.display = 'inline-block'
      }
    })
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur()
      }
    })
    // Add the input next to the target, focus it and hide the target
    target.insertAdjacentElement('afterend', input)
    target.style.display = 'none'
    input.focus()
  }

  protected handleInputConfirm(): void {
    if (this.inputValue?.trim()) {
      this.create.emit(this.inputValue)
    }
    this.inputValue = ''
    this.inputVisible = false
  }
}
