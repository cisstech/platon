import { Inject, Injectable, Optional } from '@angular/core'
import { WebComponentDefinition, WebComponentTypes, WEB_COMPONENT_DEFINITIONS } from './web-component'
import { Subject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class WebComponentService {
  private readonly submitEvent = new Subject<void>()

  /**
   * Emits when a component is auto-submitted.
   */
  readonly onSubmit = this.submitEvent.asObservable()

  constructor(
    @Optional()
    @Inject(WEB_COMPONENT_DEFINITIONS)
    private readonly definitions: WebComponentDefinition[]
  ) {
    this.definitions = (definitions || []).sort((a, b) => {
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * Finds the definition of the components of the given `type`.
   * @param type the type to find.
   */
  ofType(type: WebComponentTypes) {
    return this.definitions.filter((e) => e.type === type)
  }

  /**
   * Finds the component with the given `selector`.
   * @param selector the selector to find.
   */
  findBySelector(selector: string): WebComponentDefinition | undefined {
    return this.definitions.find((e) => e.selector === selector)
  }

  linkFromSelector(selector: string) {
    const definition = this.findBySelector(selector)
    if (!definition) return undefined
    return this.linkFromDefinition(definition)
  }

  linkFromDefinition(def: WebComponentDefinition) {
    return `/docs/components/${def.type}s/${def.selector}`
  }

  /**
   * Called from auto-submittable components to trigger the submit event.
   */
  submit() {
    this.submitEvent.next()
  }
}
