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
} from '@angular/core';
import { WebComponentDefinition } from '../../../web-component';
import { WebComponentService } from '../../../web-component.service';

@Component({
  selector: 'wc-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent implements OnInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;

  @Input() state: any;
  @Output() stateChange = new EventEmitter<any>();

  private observer?: MutationObserver;
  private definition?: WebComponentDefinition;

  constructor(
    private readonly api: WebComponentService,
    private readonly elementRef: ElementRef
  ) {}

  ngOnInit() {
    const native: HTMLElement = this.elementRef.nativeElement;
    const selector = native.parentElement?.tagName.toLowerCase();
    this.definition = this.api.findBySelector(selector || '');
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(this.createStateFromAttributes.bind(this));
    });
    this.observer.observe(native.parentElement as HTMLElement, {
      attributes: true,
    });
    this.createStateFromAttributes();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private parseAttributeValue(value: string) {
    if (value.trim().match(/^(true|false|\d+|\[|\{)/)) {
      return JSON.parse(value);
    } else {
      return value;
    }
  }

  private createStateFromAttributes() {
    const native: HTMLElement = this.elementRef.nativeElement;
    const parent = native.parentElement as HTMLElement;
    const attributes = Array.from(parent.attributes);

    const batch = attributes.find(attr => attr.name === 'state');
    if (batch) {
      this.stateChange.emit(
        this.parseAttributeValue(batch.value)
      );
      return;
    }

    const state: Record<string, any> = {};
    const properties = this.definition?.schema?.properties || {};

    let changed = false;
    for (const attribute of attributes) {
      if (attribute.name in properties) {
        changed = true;
        state[attribute.name] = this.parseAttributeValue(attribute.value);
      }
    }

    if (changed) {
      this.stateChange.emit(state);
    }
  }
}
