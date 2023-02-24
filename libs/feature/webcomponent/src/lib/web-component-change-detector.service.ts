import { ChangeDetectorRef, Injectable } from '@angular/core';
import { deepCopy, deepEqual } from '@cisstech/nge/utils';
import { WebComponentInstance } from './web-component';

@Injectable({ providedIn: 'root' })
export class WebComponentChangeDetectorService {
  /**
   * Suspends the change detection for `component`, invokes the given `action` then
   * call `onChangeState` hook of `component`.
   * @param component A webcomponent instance.
   * @param action function to invoke.
   */
  batch(component: WebComponentInstance, action: () => void) {
    const suspended = component.$__suspendChanges__$;
    component.$__suspendChanges__$ = true;

    action();

    if (component.onChangeState) {
      component.onChangeState();
    }

    if (!component.$__changeDetector__$) {
      component.$__changeDetector__$ =
        component.injector.get(ChangeDetectorRef);
    }

    component.$__changeDetector__$.detectChanges();
    component.$__suspendChanges__$ = suspended;
  }

  /**
   * Suspends the change detection for `component`, invokes the given `action` then
   * call angular change detection to refresh the view of `component`.
   *
   * Note:
   *  The difference between this method and `batch` is that this one
   *  will not call `onChangeState` hook of the component.
   *
   * @param component A webcomponent instance.
   * @param action function to invoke.
   */
  async ignore<T>(
    component: WebComponentInstance,
    action: () => T | Promise<T>
  ) {
    const suspended = component.$__suspendChanges__$;
    component.$__suspendChanges__$ = true;

    const r = await action();

    if (!component.$__changeDetector__$) {
      component.$__changeDetector__$ =
        component.injector.get(ChangeDetectorRef);
    }

    component.$__changeDetector__$.detectChanges();
    component.$__suspendChanges__$ = suspended;
    return r;
  }

  /**
   * Gets an array of the properties changed since the last change.
   * @param component A webcomponent instance.
   */
  changes(component: WebComponentInstance) {
    if (!component.$__stateCopy__$) {
      // first change.
      component.$__stateCopy__$ = deepCopy(component.$__state__$);
      return [];
    }

    const changes: string[] = [];
    const properties = new Set(
      Object.keys(component.$__state__$).concat(
        Object.keys(component.$__stateCopy__$)
      )
    );
    properties.forEach((k) => {
      if (!deepEqual(component.$__state__$[k], component.$__stateCopy__$[k])) {
        changes.push(k);
      }
    });
    component.$__stateCopy__$ = deepCopy(component.$__state__$);
    return changes;
  }
}
