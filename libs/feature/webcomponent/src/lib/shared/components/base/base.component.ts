/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { WebComponentDefinition } from '../../../web-component'
import { WebComponentService } from '../../../web-component.service'

@Component({
  selector: 'wc-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements OnInit, OnDestroy {
  @ViewChild('container') container!: ElementRef

  @Input() state: any
  @Output() stateChange = new EventEmitter<any>()

  private observer?: MutationObserver
  private definition?: WebComponentDefinition

  constructor(private readonly api: WebComponentService, private readonly elementRef: ElementRef) {}

  ngOnInit() {
    const native: HTMLElement = this.elementRef.nativeElement
    const selector = native.parentElement?.tagName.toLowerCase()
    this.definition = this.api.findBySelector(selector || '')

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(this.onChangeAttributes.bind(this))
    })

    this.observer.observe(native.parentElement as HTMLElement, {
      attributes: true,
    })
  }

  ngOnDestroy() {
    this.observer?.disconnect()
  }

  private parseValue(value: string) {
    if (value.trim().match(/^(true$|false$|\d+$|\[|\{)/)) {
      return JSON.parse(value)
    } else {
      return value
    }
  }

  private onChangeAttributes() {
    const native: HTMLElement = this.elementRef.nativeElement
    const parent = native.parentElement as HTMLElement
    const attributes = Array.from(parent.attributes)

    // LOAD FROM STATE ATTRIBUTE
    const stateAttribute = attributes.find((attr) => attr.name === 'state')
    if (stateAttribute) {
      const stateValue = stateAttribute.value.startsWith('{')
        ? stateAttribute.value
        : window.atob(stateAttribute.value)
      this.stateChange.emit(this.parseValue(stateValue))
      return
    }

    // LOAD FROM SCRIPT TAG
    const cidAttribute = attributes.find((attr) => attr.name === 'cid')
    if (cidAttribute) {
      const cidValue = cidAttribute.value
      const script = document.querySelector(`script[id="${cidValue}"]`)
      if (script) {
        this.stateChange.emit(this.parseValue(script.textContent || '{}'))
      }
      return
    }

    // LOAD INDIVIDUAL ATTRIBUTES
    const state: Record<string, any> = {}
    const properties = this.definition?.schema?.properties || {}

    let changed = false
    for (const attribute of attributes) {
      if (attribute.name in properties) {
        changed = true
        try {
          state[attribute.name] = this.parseValue(attribute.value)
        } catch {
          console.warn(`Invalid value "${attribute.value}" for ${attribute.name} attribute`)
        }
      }
    }

    if (changed) {
      this.stateChange.emit(state)
    }
  }
}
