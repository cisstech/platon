/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

@Injectable()
export class DragDropService {
  private readonly components: { [k: string]: any } = {};

  register(id: string, component: any): void {
    this.components[id] = component;
  }

  unregister(id: string): void {
    delete this.components[id];
  }

  get(id: string): any {
    if (!id) {
      return undefined;
    }
    return this.components[id];
  }
}
